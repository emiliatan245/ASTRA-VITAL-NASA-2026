/* ASTRA-VITAL v1.7.1 — Real 3D anatomy atlas loader with named pointers
   Uses the open-anatomy-3d male/female GLB models (CC BY 4.0) and Three.js.
   The model files are fetched from jsDelivr on first use; an internet connection
   is required. If the remote model cannot load, the bundled procedural 3D model
   remains available as an explicitly-labelled fallback. */
(() => {
  'use strict';
  const procedural = window.Astra3D;
  let proceduralInitCalled = false;
  if (procedural && typeof procedural.init === 'function') {
    const originalInit = procedural.init.bind(procedural);
    procedural.init = (...args) => { proceduralInitCalled = true; return originalInit(...args); };
  }
  const MODEL_BASE = 'https://cdn.jsdelivr.net/npm/open-anatomy-3d@0.1.0/models/';
  const MODEL_URLS = {
    male: MODEL_BASE + 'anatomy-male.glb',
    female: MODEL_BASE + 'anatomy-female.glb'
  };
  const PROFILE_COUNTS = { male: 140, female: 145 };
  const $ = (s, r = document) => r.querySelector(s);
  const REGIONS = {
    brain: { nodes: ['brain', 'cerebellum'], fallback: .88 },
    respiratory: { nodes: ['lung_l', 'lung_r'], fallback: .72 },
    cardio: { nodes: ['heart'], fallback: .64 },
    immune: { nodes: ['liver', 'kidney_l', 'kidney_r'], fallback: .49 },
    musculoskeletal: { nodes: ['femur_l', 'femur_r', 'pelvis'], fallback: .30 },
    wellbeing: { nodes: ['spine_lumbar', 'spinal_cord'], fallback: .42 }
  };
  const VIEWS = {
    normal:       { skin:true,  skeleton:false, muscles:false, organs:false, vessels:false, nerves:false },
    skeleton:     { skin:false, skeleton:true,  muscles:false, organs:false, vessels:false, nerves:false },
    muscular:     { skin:false, skeleton:false, muscles:true,  organs:false, vessels:false, nerves:false },
    circulation:  { skin:false, skeleton:false, muscles:false, organs:true,  vessels:true,  nerves:false },
    nervous:      { skin:false, skeleton:false, muscles:false, organs:true,  vessels:false, nerves:true  },
    all:           { skin:false, skeleton:true,  muscles:true,  organs:true,  vessels:true,  nerves:true  }
  };
  const REGION_PATTERNS = [
    [/brain|cerebell|cerebrum|optic|nerve|spinal_cord/, 'brain'],
    [/lung|bronch|trachea|diaphragm/, 'respiratory'],
    [/heart|aorta|artery|vein|vessel|atrium|ventricle/, 'cardio'],
    [/liver|kidney|spleen|pancreas|stomach|intestin|colon|gallbladder|uterus|ovary/, 'immune'],
    [/bone|femur|tibia|fibula|humerus|radius|ulna|muscle|pelvis|vertebra|cartilage/, 'musculoskeletal']
  ];

  let THREE = null, renderer = null, scene = null, camera = null, controls = null;
  let stage = null, wrap = null, realCanvas = null, fallbackCanvas = null, pointerLayer = null;
  let modelGroup = null, activeScene = null, activeProfile = null, activeView = 'normal';
  let anchors = {}, loadToken = 0, animationFrame = 0, resizeObserver = null;
  let autoRotate = true, microgravity = false, baseY = 0, lastPointer = null;
  let raycaster = null, pointer = null, selectedObject = null;
  let ready = false, attempted = false;

  function setStatus(message, state = 'info') {
    const box = $('#bodyProfileStatus');
    if (box) box.textContent = message;
    const stageStatus = $('#realAnatomyStatus');
    if (stageStatus) {
      stageStatus.textContent = message;
      stageStatus.dataset.state = state;
    }
  }

  function setWatermark(text) {
    const mark = $('.body-stage-watermark');
    if (mark) mark.textContent = text;
  }

  function showRealCanvas(show) {
    if (realCanvas) realCanvas.hidden = !show;
    if (fallbackCanvas) fallbackCanvas.style.display = show ? 'none' : 'block';
    if (stage) stage.classList.toggle('real-anatomy-ready', !!show);
  }

  function findNamedNode(name) {
    if (!activeScene) return null;
    const target = name.toLowerCase();
    let found = null;
    activeScene.traverse(node => {
      if (!found && node.name && node.name.toLowerCase() === target) found = node;
    });
    return found;
  }

  function buildAnchors() {
    anchors = {};
    if (!modelGroup || !activeScene) return;
    modelGroup.updateMatrixWorld(true);
    const fullBox = new THREE.Box3().setFromObject(activeScene);
    const size = fullBox.getSize(new THREE.Vector3());
    const center = fullBox.getCenter(new THREE.Vector3());
    const frontZ = fullBox.max.z + Math.max(.012, size.z * .025);
    for (const [region, spec] of Object.entries(REGIONS)) {
      const box = new THREE.Box3();
      let found = false;
      for (const name of spec.nodes) {
        const node = findNamedNode(name);
        if (!node) continue;
        const partBox = new THREE.Box3().setFromObject(node);
        if (partBox.isEmpty()) continue;
        if (!found) { box.copy(partBox); found = true; }
        else box.union(partBox);
      }
      let world;
      if (found) {
        world = box.getCenter(new THREE.Vector3());
        world.z = box.max.z + Math.max(.012, size.z * .025);
      } else {
        world = new THREE.Vector3(center.x, fullBox.min.y + size.y * spec.fallback, frontZ);
      }
      anchors[region] = modelGroup.worldToLocal(world.clone());
    }
  }

  function positionPointers() {
    if (!pointerLayer || !modelGroup || !camera || !stage) return;
    modelGroup.updateMatrixWorld(true);
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerLayer.querySelectorAll('.body-hotspot-v3').forEach(button => {
      const local = anchors[button.dataset.region];
      if (!local) { button.style.display = 'none'; return; }
      const world = modelGroup.localToWorld(local.clone());
      const p = world.project(camera);
      const visible = p.z > -1 && p.z < 1 && p.x > -.96 && p.x < .96 && p.y > -.96 && p.y < .96;
      const x = (p.x * .5 + .5) * rect.width;
      const y = (-p.y * .5 + .5) * rect.height;
      button.style.left = `${x}px`;
      button.style.top = `${y}px`;
      button.style.display = visible ? 'flex' : 'none';
      const preferredSide = button.dataset.labelSide || 'right';
      button.dataset.side = x > rect.width * .72 ? 'left' : x < rect.width * .28 ? 'right' : preferredSide;
    });
  }

  function applyLayer(viewKey) {
    activeView = VIEWS[viewKey] ? viewKey : 'normal';
    if (!activeScene) return;
    const mode = VIEWS[activeView];
    const layerNames = ['skin', 'skeleton', 'muscles', 'organs', 'vessels', 'nerves'];
    for (const name of layerNames) {
      const group = findNamedNode(name);
      if (group) group.visible = !!mode[name];
    }
    // In the nervous-system view, retain the brain while hiding unrelated organs.
    if (activeView === 'nervous') {
      const organs = findNamedNode('organs');
      if (organs) {
        organs.visible = true;
        organs.traverse(node => {
          if (!node.isMesh) return;
          const key = (node.name || '').toLowerCase();
          if (node !== organs && !/brain|cerebell|cerebrum|spinal|nerve/.test(key)) node.visible = false;
        });
      }
      const brain = findNamedNode('brain');
      if (brain) brain.visible = true;
    }
    if (activeView === 'all') {
      const skin = findNamedNode('skin');
      if (skin) skin.visible = false; // Keep internal systems visible in the combined view.
    }
    positionPointers();
  }

  function resize() {
    if (!renderer || !stage || !camera) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    positionPointers();
  }

  function initRenderer() {
    if (ready) return true;
    stage = $('#bodyVisualStage');
    wrap = $('#bodyImageWrap');
    pointerLayer = $('#anatomyPointerLayer');
    realCanvas = $('#astraRealAnatomyCanvas');
    fallbackCanvas = $('#astraAnatomy3DCanvas');
    if (!stage || !wrap || !pointerLayer || !realCanvas) return false;

    renderer = new THREE.WebGLRenderer({ canvas: realCanvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xe5f5ff, 0x14213c, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 3.0); key.position.set(-3, 5, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0x5db9ff, 1.8); fill.position.set(4, 1, 3); scene.add(fill);
    const rim = new THREE.DirectionalLight(0x6f8eff, 2.0); rim.position.set(0, 3, -4); scene.add(rim);

    camera = new THREE.PerspectiveCamera(31, 1, .01, 80);
    camera.position.set(0, .05, 4.6);
    modelGroup = new THREE.Group();
    scene.add(modelGroup);
    controls = new (window.__ASTRA_OrbitControls)(camera, realCanvas);
    controls.enableDamping = true;
    controls.dampingFactor = .075;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = .48;
    controls.minPolarAngle = .08;
    controls.maxPolarAngle = Math.PI - .08;
    controls.target.set(0, 0, 0);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    let down = null;
    realCanvas.addEventListener('pointerdown', event => { down = { x: event.clientX, y: event.clientY }; });
    realCanvas.addEventListener('pointerup', event => {
      if (!down) return;
      const moved = Math.hypot(event.clientX - down.x, event.clientY - down.y);
      down = null;
      if (moved > 5 || !activeScene) return;
      const rect = realCanvas.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(activeScene, true);
      if (!hits.length) return;
      let node = hits[0].object, region = null;
      while (node && node !== activeScene) {
        const keyName = (node.name || '').toLowerCase().replaceAll(' ', '_');
        for (const [pattern, candidate] of REGION_PATTERNS) if (pattern.test(keyName)) { region = candidate; break; }
        if (region) break;
        node = node.parent;
      }
      if (region && window.AstraBodySelect) window.AstraBodySelect(region);
    });

    if ('ResizeObserver' in window) { resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage); }
    window.addEventListener('resize', resize, { passive: true });
    ready = true;
    resize();
    return true;
  }

  function fitCamera(gltfScene) {
    const box = new THREE.Box3().setFromObject(gltfScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    gltfScene.position.sub(center);
    const height = Math.max(size.y, .8);
    camera.near = Math.max(.005, height / 500);
    camera.far = height * 20;
    camera.updateProjectionMatrix();
    camera.position.set(0, height * .035, height * 2.65);
    controls.target.set(0, 0, 0);
    controls.minDistance = height * 1.12;
    controls.maxDistance = height * 5.3;
    controls.update();
    return { height, size };
  }

  async function loadProfile(profile) {
    if (!ready || !['male', 'female'].includes(profile)) return;
    const token = ++loadToken;
    activeProfile = profile;
    setStatus(`Downloading real ${profile} anatomy model… first use is about 8 MB.`, 'loading');
    setWatermark('LOADING OPEN ANATOMY 3D MODEL…');
    const loader = new (window.__ASTRA_GLTFLoader)();
    loader.setMeshoptDecoder(window.__ASTRA_MeshoptDecoder);
    try {
      await window.__ASTRA_MeshoptDecoder.ready;
      const gltf = await loader.loadAsync(MODEL_URLS[profile], event => {
        if (event && event.total) setStatus(`Loading anatomy model… ${Math.round(event.loaded / event.total * 100)}%`, 'loading');
      });
      if (token !== loadToken) return;
      if (activeScene) modelGroup.remove(activeScene);
      activeScene = gltf.scene;
      activeScene.traverse(node => {
        if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; }
      });
      modelGroup.add(activeScene);
      const fit = fitCamera(activeScene);
      baseY = modelGroup.position.y;
      buildAnchors();
      applyLayer(activeView);
      controls.autoRotate = autoRotate;
      showRealCanvas(true);
      setWatermark('OPEN ANATOMY 3D · REAL HUMAN ANATOMY · EDUCATIONAL ONLY');
      const count = PROFILE_COUNTS[profile] || 'named';
      setStatus(`${profile === 'male' ? 'Male' : 'Female'} anatomical mesh loaded · ${count} named structures · drag to rotate`, 'success');
      const caption = $('.anatomy-caption');
      if (caption) caption.textContent = 'Real 3D anatomy mesh from Open Anatomy 3D. Drag to rotate, scroll to zoom, and click the named anatomical pointers to explore. Educational visualisation only—not for diagnosis or clinical decisions. Attribution: BodyParts3D / DBCLS, HuBMAP and MakeHuman; adapted by open-anatomy-3d (CC BY 4.0).';
      startAnimation();
      resize();
    } catch (error) {
      if (token !== loadToken) return;
      console.error('Open Anatomy 3D model could not be loaded; restoring the bundled procedural fallback.', error);
      showRealCanvas(false);
      setWatermark('OFFLINE FALLBACK · SIMPLIFIED 3D MODEL');
      setStatus('The detailed anatomy model needs an internet connection. Showing the built-in simplified 3D fallback.', 'warning');
      if (procedural) {
        window.Astra3D = procedural;
        if (!proceduralInitCalled) procedural.init();
        procedural.setProfile(profile);
        procedural.setView(activeView);
      }
    }
  }

  function startAnimation() {
    if (animationFrame) return;
    const tick = time => {
      animationFrame = requestAnimationFrame(tick);
      if (!renderer || !scene || !camera) return;
      if (modelGroup) modelGroup.position.y = baseY + (microgravity && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? Math.sin(time * .0009) * .018 : 0);
      controls.autoRotate = autoRotate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      controls.update();
      renderer.render(scene, camera);
      positionPointers();
    };
    animationFrame = requestAnimationFrame(tick);
  }

  function selectLayer(view) {
    activeView = VIEWS[view] ? view : 'normal';
    if (activeScene) applyLayer(activeView);
  }

  const api = {
    init() { return initRenderer(); },
    resize,
    positionPointers,
    setView(view) { selectLayer(view); },
    setProfile(profile) { if (ready) loadProfile(profile); else activeProfile = profile; },
    setMotion(auto, micro) { autoRotate = !!auto; microgravity = !!micro; if (controls) controls.autoRotate = autoRotate; },
    reset() {
      autoRotate = true; microgravity = false;
      if (controls) { controls.reset(); controls.target.set(0, 0, 0); controls.update(); }
      if (modelGroup) modelGroup.rotation.set(0, 0, 0);
      selectLayer('normal');
    },
    getState() { return { profile: activeProfile, view: activeView, auto: autoRotate, micro: microgravity, realModel: !!activeScene }; }
  };

  async function boot(THREE_MODULE, GLTFLoader_MODULE, Meshopt_MODULE, OrbitControls_MODULE) {
    THREE = THREE_MODULE;
    window.__ASTRA_GLTFLoader = GLTFLoader_MODULE.GLTFLoader;
    window.__ASTRA_MeshoptDecoder = Meshopt_MODULE.MeshoptDecoder;
    window.__ASTRA_OrbitControls = OrbitControls_MODULE.OrbitControls;
    const run = () => {
      try { if (!initRenderer()) return; } catch (error) {
        console.warn('WebGL setup failed; keeping the bundled procedural anatomy model.', error);
        setWatermark('SIMPLIFIED 3D FALLBACK · WEBGL UNAVAILABLE');
        setStatus('This browser could not start the detailed 3D atlas. The built-in simplified 3D view remains available.', 'warning');
        return;
      }
      window.Astra3D = api;
      const current = $('#bodyVisualStage');
      const profile = current?.dataset.activeProfile || $('[data-body-profile].active')?.dataset.bodyProfile;
      const view = current?.dataset.activeView || 'normal';
      selectLayer(view);
      if (profile) loadProfile(profile);
      else setWatermark('OPEN ANATOMY 3D · CHOOSE A BODY REFERENCE');
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
    else run();
  }

  // Dynamic imports are guarded: offline use continues to work with the bundled renderer.
  Promise.all([
    import('three'),
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/libs/meshopt_decoder.module.js'),
    import('three/addons/controls/OrbitControls.js')
  ]).then(modules => boot(...modules)).catch(error => {
    console.warn('Remote Three.js modules unavailable; keeping the bundled procedural anatomy model.', error);
    const show = () => {
      setWatermark('OFFLINE FALLBACK · SIMPLIFIED 3D MODEL');
      const status = $('#bodyProfileStatus');
      if (status && !status.textContent.includes('internet')) status.textContent = 'Detailed anatomical model requires internet; simplified 3D mode is available offline.';
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show, { once: true }); else show();
  });
})();
