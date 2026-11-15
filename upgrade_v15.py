from pathlib import Path
import shutil, re, json
root = Path('/mnt/data/ASTRA_VITAL_WORK/ASTRA_VITAL_v1.4.2')

# Add composite atlas artwork from an existing project asset.
source_atlas = Path('/mnt/data/user-Rtx9TLnOySUpVs3dXjxRuLu6/78f4c22bc87a4df996184923187a8973/mnt/data/ASTRA_VITAL_1_0/assets/astra-anatomy-atlas.webp')
if not source_atlas.exists():
    raise FileNotFoundError(source_atlas)
shutil.copy2(source_atlas, root/'assets'/'astra-anatomy-atlas.webp')

# Update document metadata and add v1.5 stylesheet after previous overrides.
html_path = root/'index.html'
html = html_path.read_text(encoding='utf-8')
html = html.replace('ASTRA-VITAL · 1.4.2', 'ASTRA-VITAL · 1.5.0')
html = html.replace('<link rel="stylesheet" href="anatomy-layout-fix.css" />', '<link rel="stylesheet" href="anatomy-layout-fix.css" />\n  <link rel="stylesheet" href="anatomy-station-v1.5.css" />')

# Replace body profile selector + view controls with the compact station control layout.
start = html.index('        <section class="body-profile-selector panel" id="bodyProfileSelector"')
end = html.index('\n        <div class="bodymap-layout', start)
new_controls = '''        <section class="anatomy-control-deck panel" id="bodyProfileSelector" aria-label="Anatomy display controls">
          <div class="anatomy-control-row profile-control-row">
            <div class="control-label-group"><span class="section-kicker">01 / BODY REFERENCE</span><strong>Choose a reference</strong></div>
            <div class="segmented-control profile-segment" role="group" aria-label="Choose body reference">
              <button type="button" class="body-profile-option" data-body-profile="male" aria-pressed="false">Male body</button>
              <button type="button" class="body-profile-option" data-body-profile="female" aria-pressed="false">Female body</button>
            </div>
            <span class="profile-selection-status" id="bodyProfileStatus" aria-live="polite">Choose a reference to load the atlas.</span>
          </div>
          <div class="anatomy-control-divider"></div>
          <div class="anatomy-control-row view-control-row">
            <div class="control-label-group"><span class="section-kicker">02 / ANATOMICAL LAYER</span><strong>Select a view</strong></div>
            <div class="segmented-control anatomy-view-tabs" id="bodyViewSwitcher" role="tablist" aria-label="Choose anatomical view" hidden>
              <button class="body-view-option active" type="button" data-body-view="normal" role="tab" aria-selected="true">Normal body</button>
              <button class="body-view-option" type="button" data-body-view="skeleton" role="tab" aria-selected="false">Skeleton</button>
              <button class="body-view-option" type="button" data-body-view="muscular" role="tab" aria-selected="false">Muscular system</button>
              <button class="body-view-option" type="button" data-body-view="circulation" role="tab" aria-selected="false">Circulation</button>
              <button class="body-view-option" type="button" data-body-view="nervous" role="tab" aria-selected="false">Nervous system</button>
              <button class="body-view-option" type="button" data-body-view="all" role="tab" aria-selected="false">All systems</button>
            </div>
          </div>
          <div class="anatomy-control-divider"></div>
          <div class="anatomy-control-row motion-control-row">
            <div class="control-label-group"><span class="section-kicker">03 / VIEW MOTION</span><strong>Visualise the model</strong></div>
            <div class="motion-control-buttons">
              <button type="button" class="motion-control-button" id="bodyAutoRotate" aria-pressed="false"><span>↻</span> Auto-rotate</button>
              <button type="button" class="motion-control-button" id="bodyMicrogravity" aria-pressed="false"><span>✧</span> Microgravity</button>
              <button type="button" class="motion-control-button reset-motion-button" id="bodyResetView"><span>⟲</span> Reset view</button>
            </div>
            <span class="motion-status" id="bodyMotionStatus" aria-live="polite">Static view</span>
          </div>
        </section>'''
html = html[:start] + new_controls + html[end:]

# Replace image and pointer siblings with a shared transform wrapper. This keeps markers aligned during motion.
old = '''              <img id="bodyViewImage" class="body-view-image" alt="Choose a male or female body reference to begin." loading="eager" hidden>
              <div class="body-profile-gate" id="bodyProfileGate"><span class="profile-gate-ring">◎</span><strong>Choose a body reference</strong><p>Select Male or Female above to load the anatomy atlas.</p></div>
              <div id="anatomyPointerLayer" class="anatomy-pointer-layer" aria-label="Clickable body system pointers"></div>'''
new = '''              <div class="body-image-wrap" id="bodyImageWrap" hidden>
                <div class="body-image-motion" id="bodyImageMotion">
                  <img id="bodyViewImage" class="body-view-image" alt="Choose a male or female body reference to begin." loading="eager" hidden>
                  <div id="anatomyPointerLayer" class="anatomy-pointer-layer" aria-label="Clickable body system pointers"></div>
                </div>
              </div>
              <div class="body-profile-gate" id="bodyProfileGate"><span class="profile-gate-ring">◎</span><strong>Choose a body reference</strong><p>Select Male or Female above to load the anatomy atlas.</p></div>'''
if old not in html:
    raise RuntimeError('could not locate image/pointer markup')
html = html.replace(old, new)
html = html.replace('3D-style atlas', 'anatomy atlas')
html = html.replace('ASTRA-VITAL · 1.4.2', 'ASTRA-VITAL · 1.5.0')
html = html.replace('FIVE ANATOMY MODES', 'SIX ANATOMY VIEWS')
html = html.replace('Choose a pointer to explore the selected body system.', 'Select a numbered marker to explore a body system.')

# Upgrade JS: add all-systems view and image-bound marker layout.
js_path = root/'body-view-ui.js'
js = js_path.read_text(encoding='utf-8')
# Replace VIEWS object block from const VIEWS through closing before REGION_CLASS.
vs = js.index('  const VIEWS = {')
ve = js.index('\n\n  const REGION_CLASS', vs)
views = r'''  const VIEWS = {
    normal: {
      imageFor: profile => profile === 'female' ? 'assets/body-normal-female-3d.webp' : 'assets/body-normal-male-3d.webp',
      title: 'NORMAL BODY',
      description: 'External body reference. Select a pointer to explore the related body system and its spaceflight context.',
      altFor: profile => `AI-generated educational ${profile} body reference in a fully covered blue suit. Not an anatomical scan.`,
      caption: 'NORMAL BODY · SELECT A SYSTEM',
      pointers: [
        ['brain','Brain / balance',50,8], ['respiratory','Breathing',43,27], ['cardio','Heart / circulation',55,33],
        ['immune','Immune / metabolic',50,48], ['musculoskeletal','Bone / muscle',56,69], ['wellbeing','Sleep / wellbeing',50,88]
      ]
    },
    nervous: {
      imageFor: profile => profile === 'female' ? 'assets/body-nervous-female.svg' : 'assets/body-nervous-male.svg',
      title: 'NERVOUS SYSTEM',
      description: 'Explore the brain, spinal cord and peripheral nerve pathways. Markers identify educational regions, not examination sites.',
      altFor: profile => `Educational ${profile} nervous-system illustration showing the brain, spinal cord and peripheral nerve paths. Not a medical scan.`,
      caption: 'NERVOUS SYSTEM · SELECT A REGION',
      pointers: [
        ['brain','Brain / balance',50,8], ['respiratory','Autonomic breathing',43,28], ['cardio','Autonomic circulation',55,32],
        ['immune','Spinal pathways',51,46], ['musculoskeletal','Peripheral nerves',57,69], ['wellbeing','Sleep / wellbeing',50,88]
      ]
    },
    circulation: {
      image: 'assets/body-circulation.webp', title: 'ORGANS & CIRCULATION',
      description: 'Explore the heart, lungs, visible vessels and abdominal organs. This general reference is not a personalised scan.',
      alt: 'Educational illustration of internal organs, blood vessels and circulation. Not a medical scan.', caption: 'ORGANS & CIRCULATION · SELECT A SYSTEM',
      pointers: [
        ['brain','Brain',50,8], ['respiratory','Lungs',43,26], ['cardio','Heart',54,31], ['immune','Abdominal organs',50,47],
        ['musculoskeletal','Lower-limb vessels',54,70], ['wellbeing','Whole-crew wellbeing',50,88]
      ]
    },
    skeleton: {
      image: 'assets/body-skeleton.webp', title: 'SKELETAL SYSTEM',
      description: 'Explore the skull, rib cage, spine, pelvis and long bones. Pointers are illustrative—not examination sites.',
      alt: 'Educational full-body skeleton illustration. Not an anatomical scan.', caption: 'SKELETAL SYSTEM · SELECT A REGION',
      pointers: [
        ['brain','Skull / orientation',50,8], ['respiratory','Rib cage',50,27], ['cardio','Thoracic region',52,33],
        ['immune','Spine / trunk',50,46], ['musculoskeletal','Pelvis / long bones',50,64], ['wellbeing','Whole-crew wellbeing',50,88]
      ]
    },
    muscular: {
      image: 'assets/body-muscular.webp', title: 'MUSCULAR SYSTEM',
      description: 'Explore major muscle groups involved in posture and movement. This illustration does not measure strength or muscle loss.',
      alt: 'Educational full-body muscular-system illustration. Not an anatomical scan.', caption: 'MUSCULAR SYSTEM · SELECT A REGION',
      pointers: [
        ['brain','Motor coordination',50,8], ['respiratory','Breathing muscles',43,26], ['cardio','Chest region',54,31],
        ['immune','Core / trunk',50,47], ['musculoskeletal','Leg muscles',52,70], ['wellbeing','Whole-crew wellbeing',50,88]
      ]
    },
    all: {
      image: 'assets/astra-anatomy-atlas.webp', title: 'ALL BODY SYSTEMS',
      description: 'Compare the skeleton, internal organs and circulation, and muscular system in one multi-view anatomy plate. This general reference is not personalised.',
      alt: 'Educational three-view anatomy atlas showing skeleton, internal organs and circulation, and muscular system. Not a medical scan.',
      caption: 'ALL BODY SYSTEMS · MULTI-VIEW ATLAS', wide: true,
      pointers: [
        ['brain','Brain / balance',50,8], ['respiratory','Lungs / breathing',50,27], ['cardio','Heart / circulation',50,33],
        ['immune','Abdominal organs',50,48], ['musculoskeletal','Skeleton / bone',22,57], ['wellbeing','Muscle / movement',78,57]
      ]
    }
  };'''
js = js[:vs] + views + js[ve:]

# Replace imageFor + pointer positioning helpers up to clearRegionSelection.
ps = js.index('  function imageFor(config) {')
pe = js.index('\n  function clearRegionSelection()', ps)
positioning = r'''  function imageFor(config) {
    return config.imageFor ? config.imageFor(selectedProfile || 'male') : config.image;
  }

  // Size a dedicated image-and-pointer wrapper. Markers are positioned as
  // percentages inside this wrapper, so image and markers move together.
  let pointerLayoutObserver = null;
  let pointerLayoutFrame = 0;
  function sizeAnatomyFigure() {
    const stage = $('#bodyVisualStage');
    const image = $('#bodyViewImage');
    const wrap = $('#bodyImageWrap');
    if (!stage || !image || !wrap || image.hidden || !image.complete || !image.naturalWidth) return;
    const aspect = image.naturalWidth / image.naturalHeight;
    const isWide = stage.dataset.activeView === 'all';
    const maxW = stage.clientWidth * (isWide ? 0.96 : 0.82);
    const maxH = stage.clientHeight * 0.94;
    let width = Math.min(maxW, maxH * aspect);
    let height = width / aspect;
    if (height > maxH) { height = maxH; width = height * aspect; }
    wrap.style.width = `${Math.round(width)}px`;
    wrap.style.height = `${Math.round(height)}px`;
  }
  function positionPointers() {
    const layer = $('#anatomyPointerLayer');
    if (!layer) return;
    layer.querySelectorAll('.body-hotspot-v3').forEach(marker => {
      marker.style.left = `${Number(marker.dataset.pointX)}%`;
      marker.style.top = `${Number(marker.dataset.pointY)}%`;
    });
  }
  function schedulePointerLayout() {
    if (pointerLayoutFrame) cancelAnimationFrame(pointerLayoutFrame);
    pointerLayoutFrame = requestAnimationFrame(() => {
      pointerLayoutFrame = 0;
      sizeAnatomyFigure();
      positionPointers();
    });
  }
  function observePointerLayout() {
    const stage = $('#bodyVisualStage');
    if (pointerLayoutObserver) pointerLayoutObserver.disconnect();
    if ('ResizeObserver' in window && stage) {
      pointerLayoutObserver = new ResizeObserver(schedulePointerLayout);
      pointerLayoutObserver.observe(stage);
    }
    window.addEventListener('resize', schedulePointerLayout, { passive: true });
  }
  function setMotionButton(id, active) {
    const button = $(`#${id}`);
    if (!button) return;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  function updateMotionStatus() {
    const stage = $('#bodyVisualStage');
    const auto = stage?.classList.contains('motion-auto');
    const micro = stage?.classList.contains('motion-micro');
    const status = $('#bodyMotionStatus');
    if (status) status.textContent = auto && micro ? 'Auto-rotate + microgravity visualisation' : auto ? 'Illustrative auto-rotation on' : micro ? 'Microgravity float visualisation on' : 'Static view';
    setMotionButton('bodyAutoRotate', !!auto);
    setMotionButton('bodyMicrogravity', !!micro);
  }
  function initMotionControls() {
    const stage = $('#bodyVisualStage');
    $('#bodyAutoRotate')?.addEventListener('click', () => {
      stage?.classList.toggle('motion-auto');
      updateMotionStatus();
    });
    $('#bodyMicrogravity')?.addEventListener('click', () => {
      stage?.classList.toggle('motion-micro');
      updateMotionStatus();
    });
    $('#bodyResetView')?.addEventListener('click', () => {
      stage?.classList.remove('motion-auto','motion-micro');
      updateMotionStatus();
      if (selectedProfile) setBodyView('normal');
      clearRegionSelection();
    });
  }'''
js = js[:ps] + positioning + js[pe:]

# In setBodyView: image wrapper visibility and sizing callbacks + wide counter.
js = js.replace("    image.hidden = false;\n    const nextSrc = imageFor(config);", "    image.hidden = false;\n    const imageWrap = $('#bodyImageWrap');\n    if (imageWrap) imageWrap.hidden = false;\n    const nextSrc = imageFor(config);")
js = js.replace("      image.classList.remove('view-changing');\n      schedulePointerLayout();", "      image.classList.remove('view-changing');\n      schedulePointerLayout();")
js = js.replace("    $('#bodyViewCounter').textContent = `VIEW ${String(Object.keys(VIEWS).indexOf(viewKey)+1).padStart(2,'0')} / ${String(Object.keys(VIEWS).length).padStart(2,'0')}`;", "    $('#bodyViewCounter').textContent = `VIEW ${String(Object.keys(VIEWS).indexOf(viewKey)+1).padStart(2,'0')} / ${String(Object.keys(VIEWS).length).padStart(2,'0')}`;")
# Avoid title counter accidental stale and schedule size after dataset.
js = js.replace("    $('#bodyVisualStage').dataset.activeProfile = selectedProfile;\n    $$('[data-body-view]')", "    $('#bodyVisualStage').dataset.activeProfile = selectedProfile;\n    schedulePointerLayout();\n    $$('[data-body-view]')")
# The body image wrapper should be hidden before profile choice.
js = js.replace("    if (initialImage) { initialImage.hidden = true; initialImage.removeAttribute('src'); }\n    $('#bodyVisualStage').classList.add('profile-required');", "    if (initialImage) { initialImage.hidden = true; initialImage.removeAttribute('src'); }\n    const initialWrap = $('#bodyImageWrap');\n    if (initialWrap) initialWrap.hidden = true;\n    $('#bodyVisualStage').classList.add('profile-required');")
# init controls call
js = js.replace("    observePointerLayout();\n    $$('[data-body-profile]')", "    observePointerLayout();\n    initMotionControls();\n    updateMotionStatus();\n    $$('[data-body-profile]')")

js_path.write_text(js, encoding='utf-8')

# Patch installer documentation, version metadata and simple tests.
(root/'VERSION.txt').write_text('ASTRA-VITAL 1.5.0\nAnatomy station layout, six view modes, correctly scaled image/pointer wrapper, and visual motion controls.\n', encoding='utf-8')
(root/'CHANGELOG_v1.5.0.md').write_text('''# ASTRA-VITAL v1.5.0 — Anatomy Station\n\n- Reworked the anatomy explorer to match the wide two-column workstation layout.\n- Added compact male/female reference selector and six anatomical view tabs.\n- Added the All Systems comparison plate (skeleton, internal organs/circulation, muscular system).\n- Added Auto-rotate, Microgravity and Reset view controls. These are illustrative visual modes, not physical simulations or a rotatable anatomical mesh.\n- Rebuilt image sizing and pointer alignment around a shared responsive image wrapper.\n- Kept the educational, non-diagnostic boundaries and existing health-assessment workflow.\n''', encoding='utf-8')
(root/'PATCH_INSTALL_v1.5.0.md').write_text('''# Install ASTRA-VITAL v1.5.0 update\n\n1. Back up the current project folder and export any local CSV records.\n2. Extract the patch ZIP.\n3. Copy `index.html`, `body-view-ui.js`, and `anatomy-station-v1.5.css` into the existing project folder.\n4. Copy `assets/astra-anatomy-atlas.webp` into the existing `assets` folder.\n5. Replace files when asked, keeping all other assets and scripts.\n6. Reopen `index.html` and press Ctrl+Shift+R.\n\nThe controls provide visual illustration motion only. The images are static educational artwork with clickable overlays, not a true rotatable 3D anatomical mesh or diagnostic imagery.\n''', encoding='utf-8')

html_path.write_text(html, encoding='utf-8')
print('Updated', root)
