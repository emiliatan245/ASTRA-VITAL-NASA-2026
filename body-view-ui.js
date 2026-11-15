(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  let selectedProfile = null;
  let selectedView = 'normal';

  const VIEWS = {
    normal:{title:'NORMAL BODY',description:'Explore the human body in a rotatable 3D model. Select a named pointer to learn about the structure and its mission-health context.',caption:'3D NORMAL BODY · SELECT AN ANATOMICAL POINTER',pointers:[['brain','Brain','right'],['respiratory','Lungs','left'],['cardio','Heart','right'],['immune','Liver & kidneys','left'],['musculoskeletal','Pelvis & legs','right'],['wellbeing','Spinal cord','left']]},
    skeleton:{title:'SKELETAL SYSTEM',description:'Explore the skull, rib cage, spine, pelvis and long bones in a rotatable 3D skeletal model.',caption:'3D SKELETAL SYSTEM · SELECT A STRUCTURE',pointers:[['brain','Skull','right'],['respiratory','Rib cage','left'],['cardio','Sternum','right'],['immune','Spine','left'],['musculoskeletal','Pelvis & femur','right'],['wellbeing','Vertebrae','left']]},
    muscular:{title:'MUSCULAR SYSTEM',description:'Explore major muscle groups that support posture, breathing and movement. The model does not measure muscle strength or muscle loss.',caption:'3D MUSCULAR SYSTEM · SELECT A MUSCLE GROUP',pointers:[['brain','Neck muscles','right'],['respiratory','Diaphragm','left'],['cardio','Chest muscles','right'],['immune','Abdominal muscles','left'],['musculoskeletal','Thigh muscles','right'],['wellbeing','Back muscles','left']]},
    circulation:{title:'ORGANS & CIRCULATION',description:'Explore the heart, lungs, major vessels and selected abdominal organs in a rotatable 3D educational model.',caption:'3D ORGANS & CIRCULATION · SELECT AN ORGAN',pointers:[['brain','Brain vessels','right'],['respiratory','Lungs','left'],['cardio','Heart','right'],['immune','Liver & kidneys','left'],['musculoskeletal','Leg vessels','right'],['wellbeing','Aorta & spine','left']]},
    nervous:{title:'NERVOUS SYSTEM',description:'Explore the brain, spinal cord and simplified peripheral nerve pathways. This is a learning model, not a medical scan.',caption:'3D NERVOUS SYSTEM · SELECT A STRUCTURE',pointers:[['brain','Brain','right'],['respiratory','Autonomic pathways','left'],['cardio','Cardiac nerves','right'],['immune','Spinal cord','left'],['musculoskeletal','Peripheral nerves','right'],['wellbeing','Spinal pathways','left']]},
    all:{title:'ALL BODY SYSTEMS',description:'View multiple educational layers together: skeleton, muscles, major organs, circulation and nerve pathways.',caption:'3D ALL SYSTEMS · SELECT AN ANATOMICAL POINTER',pointers:[['brain','Brain','right'],['respiratory','Lungs','left'],['cardio','Heart','right'],['immune','Liver & kidneys','left'],['musculoskeletal','Pelvis & femur','right'],['wellbeing','Spine','left']]}
  };
  const REGION_CLASS={brain:'neuro',respiratory:'respiratory',cardio:'cardio',immune:'immune',musculoskeletal:'muscle',wellbeing:'wellbeing'};

  function schedulePointerLayout(){window.Astra3D?.resize();window.Astra3D?.positionPointers();}
  function setMotionButton(id,active){const b=$(`#${id}`);if(!b)return;b.classList.toggle('active',!!active);b.setAttribute('aria-pressed',String(!!active));}
  function updateMotionStatus(){
    const stage=$('#bodyVisualStage'),auto=!!stage?.classList.contains('motion-auto'),micro=!!stage?.classList.contains('motion-micro');
    const status=$('#bodyMotionStatus');
    if(status)status.textContent=auto&&micro?'3D auto-rotate + microgravity animation':auto?'3D auto-rotation on':micro?'Microgravity float animation on':'Drag to rotate · scroll to zoom';
    setMotionButton('bodyAutoRotate',auto);setMotionButton('bodyMicrogravity',micro);
    window.Astra3D?.setMotion(auto,micro);
  }
  function clearRegionSelection(){
    $$('.body-hotspot,.body-region-chip').forEach(el=>{el.classList.remove('selected');el.setAttribute('aria-pressed','false');});
    const hint=$('#bodySelectedHint');if(hint)hint.textContent=selectedProfile?`${selectedProfile==='male'?'Male':'Female'} reference · choose a system pointer`:'Choose a body reference above';
  }
  function renderPointers(viewKey){
    const layer=$('#anatomyPointerLayer');if(!layer)return;
    const config=VIEWS[viewKey];
    layer.innerHTML=config.pointers.map(([region,label,side])=>`
      <button type="button" class="body-hotspot body-hotspot-v3 region-${REGION_CLASS[region]}" data-region="${region}" data-label-side="${side}" data-side="${side}"
        aria-pressed="false" aria-label="${label}. Select to explore this anatomical structure.">
        <span class="hotspot-pin" aria-hidden="true"><span></span></span>
        <span class="hotspot-connector" aria-hidden="true"></span>
        <span class="hotspot-label">${label}</span>
      </button>`).join('');
    const chip=$('.body-region-chip.selected');
    if(chip){const match=$(`.body-hotspot[data-region="${chip.dataset.region}"]`,layer);if(match){match.classList.add('selected');match.setAttribute('aria-pressed','true');}}
    schedulePointerLayout();
  }
  function setBodyView(viewKey){
    const config=VIEWS[viewKey];if(!config||!selectedProfile)return;
    selectedView=viewKey;
    const stage=$('#bodyVisualStage'),wrap=$('#bodyImageWrap');
    if(wrap)wrap.hidden=false;
    if(stage){stage.dataset.activeView=viewKey;stage.dataset.activeProfile=selectedProfile;stage.classList.add('profile-ready');stage.classList.remove('profile-required');}
    const gate=$('#bodyProfileGate');if(gate)gate.hidden=true;
    $('#bodyViewKicker').textContent=config.title;
    $('#bodyViewDescription').textContent=config.description;
    $('#bodyStageCaption').textContent=config.caption;
    $('#bodyViewCounter').textContent='ANATOMY LAYER';
    $$('[data-body-view]').forEach(btn=>{const active=btn.dataset.bodyView===viewKey;btn.classList.toggle('active',active);btn.setAttribute('aria-selected',String(active));});
    renderPointers(viewKey);window.Astra3D?.setView(viewKey);schedulePointerLayout();
    const chip=$('.body-region-chip.selected');$('#bodySelectedHint').textContent=chip?`Selected system: ${chip.textContent.trim()}`:`${selectedProfile==='male'?'Male':'Female'} reference · ${config.title.toLowerCase()}`;
  }
  function chooseProfile(profile){
    if(!['male','female'].includes(profile))return;
    selectedProfile=profile;
    $$('[data-body-profile]').forEach(btn=>{const active=btn.dataset.bodyProfile===profile;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});
    $('#bodyProfileStatus').textContent=`${profile==='male'?'Male':'Female'} 3D reference selected. Choose an anatomical layer.`;
    $('#bodyViewSwitcher').hidden=false;
    $('#bodyVisualStage').classList.add('profile-ready');$('#bodyVisualStage').classList.remove('profile-required');
    const gate=$('#bodyProfileGate');if(gate)gate.hidden=true;
    const wrap=$('#bodyImageWrap');if(wrap)wrap.hidden=false;
    window.Astra3D?.setProfile(profile);
    clearRegionSelection();setBodyView('normal');
    if(window.AstraBodySelectReset)window.AstraBodySelectReset();
  }
  function initMotionControls(){
    const stage=$('#bodyVisualStage');
    // Start with a slow, clearly visible 3D idle rotation so the model never looks like a static picture.
    stage?.classList.add('motion-auto');
    $('#bodyAutoRotate')?.addEventListener('click',()=>{stage?.classList.toggle('motion-auto');updateMotionStatus();});
    $('#bodyMicrogravity')?.addEventListener('click',()=>{stage?.classList.toggle('motion-micro');updateMotionStatus();});
    $('#bodyResetView')?.addEventListener('click',()=>{stage?.classList.remove('motion-micro');stage?.classList.add('motion-auto');window.Astra3D?.reset();updateMotionStatus();setBodyView('normal');clearRegionSelection();});
    updateMotionStatus();
  }
  function initBodyViews(){
    const layer=$('#anatomyPointerLayer');if(!layer)return;
    const ok=window.Astra3D?.init();
    if(!ok)console.warn('ASTRA-VITAL 3D anatomy renderer did not initialise.');
    initMotionControls();
    $$('[data-body-profile]').forEach(btn=>btn.addEventListener('click',()=>chooseProfile(btn.dataset.bodyProfile)));
    $$('[data-body-view]').forEach(btn=>btn.addEventListener('click',()=>setBodyView(btn.dataset.bodyView)));
    layer.addEventListener('click',event=>{const marker=event.target.closest('.body-hotspot');if(marker&&window.AstraBodySelect){window.AstraBodySelect(marker.dataset.region);$('#bodySelectedHint').textContent=`Selected structure: ${marker.querySelector('.hotspot-label').textContent}`;}});
    const chips=$('.bodymap-legend-violet');chips?.addEventListener('click',event=>{const chip=event.target.closest('.body-region-chip');if(!chip||!window.AstraBodySelect)return;window.AstraBodySelect(chip.dataset.region);$('#bodySelectedHint').textContent=`Selected system: ${chip.textContent.trim()}`;});
    $('#bodyViewSwitcher').hidden=true;
    const wrap=$('#bodyImageWrap');if(wrap)wrap.hidden=true;
    $('#bodyVisualStage').classList.add('profile-required');$('#bodyVisualStage').dataset.activeView='normal';
    $('#bodyProfileStatus').textContent='Choose Male or Female to load the 3D model.';
    $('#bodySelectedHint').textContent='Choose a body reference above';
    $('#bodyViewDescription').textContent='Choose a body reference to load the interactive 3D model.';
    $('#bodyViewKicker').textContent='BODY REFERENCE REQUIRED';
    const gate=$('#bodyProfileGate');if(gate)gate.hidden=false;
    renderPointers('normal');
  }

  function initWelcome(){
    const screen=$('#welcomeScreen');if(!screen)return;
    const rememberKey='astra-vital-welcome-v1.4.2';let skipWelcome=false;
    try{skipWelcome=localStorage.getItem(rememberKey)==='skip';}catch(error){console.warn('Welcome preference storage unavailable; showing launch screen normally.',error);}
    screen.classList.remove('welcome-hidden','welcome-exit','rocket-launching');screen.setAttribute('aria-hidden','false');
    if(skipWelcome){screen.classList.add('welcome-hidden');screen.setAttribute('aria-hidden','true');}
    const showWelcome=()=>{screen.classList.remove('welcome-hidden','welcome-exit','rocket-launching');screen.setAttribute('aria-hidden','false');document.body.classList.remove('mission-entry');screen.scrollTo({top:0,behavior:'auto'});const checkbox=$('#rememberWelcome');if(checkbox)checkbox.checked=false;};
    $('#reopenWelcome')?.addEventListener('click',showWelcome);
    const updateParallax=()=>{const maxScroll=Math.max(1,screen.scrollHeight-screen.clientHeight),progress=Math.max(0,Math.min(1,screen.scrollTop/maxScroll)),y=Math.round(progress*-44),x=Math.round(progress*38),visual=$('.welcome-visual',screen);visual?.style.setProperty('--welcome-parallax-y',`${y}px`);visual?.style.setProperty('--welcome-parallax-x',`${x}px`);screen.style.setProperty('--welcome-progress',progress.toFixed(3));};
    screen.addEventListener('scroll',updateParallax,{passive:true});updateParallax();
    if('IntersectionObserver'in window){const cards=$$('.welcome-brief-card',screen),observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{root:screen,threshold:.12});cards.forEach(card=>observer.observe(card));}else $$('.welcome-brief-card',screen).forEach(card=>card.classList.add('in-view'));
    const close=targetView=>{if(screen.classList.contains('rocket-launching'))return;try{if($('#rememberWelcome')?.checked)localStorage.setItem(rememberKey,'skip');else localStorage.removeItem(rememberKey);}catch(_){}const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;screen.classList.add('rocket-launching');document.body.classList.add('mission-entry');window.setTimeout(()=>{screen.classList.add('welcome-exit');window.setTimeout(()=>{screen.classList.add('welcome-hidden');screen.setAttribute('aria-hidden','true');screen.classList.remove('rocket-launching','welcome-exit');if(targetView)$(`.nav-item[data-view="${targetView}"]`)?.click();},reduced?20:260);},reduced?20:610);};
    $('#launchFlightDeck')?.addEventListener('click',()=>close('overview'));$('#welcomeQuickEnter')?.addEventListener('click',()=>close('overview'));$('#welcomeExploreAnatomy')?.addEventListener('click',()=>close('bodymap'));
    document.addEventListener('keydown',event=>{if(!screen.classList.contains('welcome-hidden')&&event.key==='Escape')close('overview');});
  }
  document.addEventListener('DOMContentLoaded',()=>{initWelcome();initBodyViews();});
})();
