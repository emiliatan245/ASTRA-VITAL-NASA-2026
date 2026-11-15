/* ASTRA-VITAL v1.0 mission features
   Synthetic-only Random Forest inference, interactive body-system map,
   environment context and non-clinical mission-routine gamification.
*/
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const MODEL = window.ASTRA_MODEL;
  let lastSuccessfulAssessment = null;
  const ASSESSMENT_LOG_KEY = 'astra-vital-synthetic-assessment-log-v1';

  const FEATURE_FIELDS = [
    ['heart_rate_bpm', 'sensorHr'],
    ['spo2_pct', 'sensorSpo2'],
    ['resp_rate_min', 'sensorResp'],
    ['temperature_c', 'sensorTemp'],
    ['sleep_hours', 'sensorSleep'],
    ['fatigue_1_5', 'sensorFatigue'],
    ['mood_1_5', 'sensorMood'],
    ['dizziness_0_1', 'sensorDizziness'],
    ['breathlessness_0_1', 'sensorBreathlessness'],
    ['nausea_0_1', 'sensorNausea']
  ];
  const DISPLAY = {
    routine_pattern: { title: 'Routine-like synthetic pattern', tone: 'routine', description: 'This input set is most similar to the routine-like examples generated for this software demonstration.', next: 'Review the signal-quality note and keep following the mission-approved measurement schedule. A routine-like model output is not an all-clear and does not establish medical fitness.' },
    review_pattern: { title: 'Review-pattern scenario', tone: 'review', description: 'The model groups this input set with synthetic examples that contain a more mixed set of signals.', next: 'For this demonstration, verify the values and timestamps, repeat an uncertain measurement using the approved device instructions, and document the context. In real operations, follow the mission medical reporting procedure.' },
    priority_review_pattern: { title: 'Priority-review scenario', tone: 'priority', description: 'The model groups this input set with synthetic examples generated to represent a stronger multi-signal deviation pattern.', next: 'This label does not determine urgency. For a real operational concern, follow the mission escalation or emergency protocol and contact qualified flight-medical support. Do not rely on this model.' }
  };

  function predict(input) {
    if (!MODEL || !Array.isArray(MODEL.trees)) throw new Error('Synthetic model file did not load. Keep model.js beside index.html.');
    const sums = [0, 0, 0];
    for (const tree of MODEL.trees) {
      let index = 0;
      let guard = 0;
      while (tree[index] && tree[index].f >= 0 && guard++ < 100) {
        const node = tree[index];
        index = input[node.f] <= node.t ? node.l : node.r;
      }
      const leaf = tree[index];
      if (!leaf || !Array.isArray(leaf.p)) throw new Error('Model tree is malformed.');
      leaf.p.forEach((p, i) => sums[i] += p);
    }
    const total = MODEL.trees.length || 1;
    const probs = sums.map(v => v / total);
    const classIndex = probs.indexOf(Math.max(...probs));
    return { index: classIndex, probabilities: probs, key: MODEL.meta.classes[classIndex], confidence: probs[classIndex] };
  }

  function readAssessment() {
    const values = {};
    const raw = {};
    FEATURE_FIELDS.forEach(([feature, id]) => {
      const element = document.getElementById(id);
      const value = Number(element.value);
      if (!Number.isFinite(value)) throw new Error(`Enter a valid number for ${feature.replaceAll('_', ' ')}.`);
      values[feature] = value;
      raw[id] = element.value;
    });
    const bounds = [
      ['heart_rate_bpm', 30, 220], ['spo2_pct', 70, 100], ['resp_rate_min', 4, 45],
      ['temperature_c', 33, 42], ['sleep_hours', 0, 24], ['fatigue_1_5', 1, 5],
      ['mood_1_5', 1, 5], ['dizziness_0_1', 0, 1], ['breathlessness_0_1', 0, 1], ['nausea_0_1', 0, 1]
    ];
    for (const [key, low, high] of bounds) {
      if (values[key] < low || values[key] > high) throw new Error(`${key.replaceAll('_', ' ')} is outside this demo form's input range. These bounds are not clinical limits.`);
    }
    return { ordered: MODEL.meta.features.map(name => values[name]), values, raw };
  }

  function renderPrediction(result, input) {
    const info = DISPLAY[result.key];
    const env = $('#missionEnvironment').selectedOptions[0].textContent;
    const quality = $('#signalQuality').value;
    const probs = result.probabilities;
    const names = MODEL.meta.display_classes;
    const probabilityBars = probs.map((p, i) => `
      <div class="probability-row"><div><span>${names[i]}</span><b>${(p * 100).toFixed(1)}%</b></div><div class="probability-track"><i style="width:${(p * 100).toFixed(1)}%"></i></div></div>`).join('');
    const inputSummary = [
      `HR ${input.values.heart_rate_bpm} bpm`, `SpO₂ ${input.values.spo2_pct}%`,
      `Resp ${input.values.resp_rate_min}/min`, `Temp ${input.values.temperature_c} °C`,
      `Sleep ${input.values.sleep_hours} h`, `Fatigue ${input.values.fatigue_1_5}/5`,
      `Mood ${input.values.mood_1_5}/5`
    ].join(' · ');
    const confidenceNote = result.confidence < 0.60
      ? 'The model probabilities are distributed across classes; treat this as a mixed synthetic pattern rather than a confident category.'
      : 'The highest probability is the model’s preferred synthetic scenario label, not a probability of disease or medical risk.';
    $('#modelResultPanel').innerHTML = `
      <span class="section-kicker">02 / SYNTHETIC MODEL OUTPUT</span>
      <div class="prediction-head ${info.tone}"><span class="prediction-icon">${info.tone === 'routine' ? '✓' : info.tone === 'review' ? '↗' : '!'}</span><div><small>MODEL SCENARIO CLASS</small><h3>${info.title}</h3></div></div>
      <p class="prediction-description">${info.description}</p>
      <div class="confidence-strip"><div><small>TOP CLASS PROBABILITY</small><strong>${(result.confidence * 100).toFixed(1)}%</strong></div><span>${confidenceNote}</span></div>
      <div class="probability-list"><div class="section-kicker">CLASS PROBABILITIES</div>${probabilityBars}</div>
      <div class="result-action"><span class="section-kicker">DEMO FOLLOW-UP GUIDANCE</span><p>${info.next}</p></div>
      <div class="assessment-context"><b>Mission environment:</b> ${escapeHtml(env)}<br><b>Signal quality:</b> ${quality === 'good' ? 'Good' : 'Uncertain'}<br><b>Inputs:</b> ${escapeHtml(inputSummary)}</div>
      <div class="result-disclaimer"><strong>Important interpretation boundary</strong><p>All model classes, training records and labels are synthetic. The displayed probability is a model score over artificial labels, not a medical probability, diagnosis, treatment recommendation or emergency triage.</p></div>
      <button class="button button-secondary full-button" id="saveAssessmentScenario" type="button">Save this synthetic scenario to local log</button>`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function runModel() {
    const feedback = $('#assessmentFeedback');
    try {
      const quality = $('#signalQuality').value;
      if (quality === 'poor') {
        $('#modelResultPanel').innerHTML = `<span class="section-kicker">02 / INPUT QUALITY GATE</span><h3>Classification not run</h3><div class="quality-warning"><b>Poor signal quality selected.</b><p>This prototype blocks model classification when the simulated signal is marked poor. Review device status and repeat the scenario only according to approved device instructions. This is a software data-quality gate, not medical advice.</p></div>`;
        feedback.textContent = 'Model not run: poor-quality signal selected.';
        return;
      }
      const input = readAssessment();
      const result = predict(input.ordered);
      lastSuccessfulAssessment = {
        savedAt: new Date().toISOString(), environment: $('#missionEnvironment').selectedOptions[0].textContent,
        quality, values: input.values, label: result.key, confidence: result.confidence,
        probabilities: result.probabilities
      };
      renderPrediction(result, input);
      feedback.textContent = 'Synthetic scenario classification complete. No data was sent to a server.';
    } catch (err) {
      feedback.textContent = err.message || 'Could not run the synthetic model.';
      $('#modelResultPanel').innerHTML = `<span class="section-kicker">INPUT VALIDATION</span><h3>Check the scenario inputs</h3><div class="quality-warning">${escapeHtml(err.message || 'Invalid input.')}</div>`;
    }
  }

  function readAssessmentLog() {
    try { const value = JSON.parse(localStorage.getItem(ASSESSMENT_LOG_KEY) || '[]'); return Array.isArray(value) ? value : []; }
    catch (_) { return []; }
  }
  function renderAssessmentLog() {
    const target = $('#assessmentHistoryBody'); if (!target) return;
    const items = readAssessmentLog().slice().reverse();
    if (!items.length) { target.innerHTML = '<tr><td colspan="8" class="empty-row">No saved scenarios yet. Run a synthetic assessment and choose Save to local log.</td></tr>'; return; }
    const label = { routine_pattern: 'Routine-like pattern', review_pattern: 'Review pattern', priority_review_pattern: 'Priority review pattern' };
    target.innerHTML = items.slice(0, 30).map(item => {
      const v = item.values;
      const t = new Date(item.savedAt).toLocaleString();
      return `<tr><td>${escapeHtml(t)}</td><td>${escapeHtml(item.environment)}</td><td>${v.heart_rate_bpm} bpm</td><td>${v.spo2_pct}%</td><td>${v.resp_rate_min}/min</td><td>${v.temperature_c} °C</td><td>${escapeHtml(label[item.label] || item.label)}</td><td>${(item.confidence * 100).toFixed(1)}%</td></tr>`;
    }).join('');
  }
  function saveAssessmentScenario() {
    if (!lastSuccessfulAssessment) return;
    const list = readAssessmentLog(); list.push(lastSuccessfulAssessment);
    try { localStorage.setItem(ASSESSMENT_LOG_KEY, JSON.stringify(list.slice(-100))); }
    catch (_) { showToast('Could not save this scenario in browser storage.'); return; }
    renderAssessmentLog(); showToast('Synthetic scenario saved locally.');
  }
  function exportAssessmentLog() {
    const list = readAssessmentLog();
    if (!list.length) return showToast('No assessment scenarios to export yet.');
    const headers = ['saved_at','environment','signal_quality','heart_rate_bpm','spo2_pct','resp_rate_min','temperature_c','sleep_hours','fatigue_1_5','mood_1_5','dizziness_0_1','breathlessness_0_1','nausea_0_1','synthetic_model_label','top_class_score'];
    const rows = list.map(item => [item.savedAt,item.environment,item.quality,...MODEL.meta.features.map(k => item.values[k]),item.label,item.confidence]);
    const csv = [headers,...rows].map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='astra-vital-synthetic-assessment-log.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    showToast('Synthetic assessment CSV exported.');
  }

  const environmentCopy = {
    leo: ['Orbital station / LEO', 'Context only: follow the assigned crew medical measurement schedule and the device instructions. This environment selector does not alter the model prediction.'],
    transit: ['Transit spacecraft', 'Context only: consider the mission timeline, vehicle routines and communication constraints when recording notes. This environment selector does not alter the model prediction.'],
    lunar: ['Lunar surface base', 'Context only: lunar operations include a different gravity and surface-activity context. Record the mission context supplied by the crew schedule. This environment selector does not alter the model prediction.'],
    mars: ['Mars surface habitat', 'Context only: a Mars habitat has communication delay and long-duration isolation considerations. Record the context and use mission-approved support pathways. This environment selector does not alter the model prediction.']
  };
  function updateEnvironment() {
    const item = environmentCopy[$('#missionEnvironment').value];
    $('#environmentGuide').innerHTML = `<strong>${item[0]}</strong><p>${item[1]}</p>`;
  }

  const BODY_INFO = {
    brain: {
      title: 'Brain & neurovestibular system', intro: 'The brain and vestibular system support balance, orientation, coordination and the interpretation of movement.',
      purpose: 'Helps the crew member maintain orientation, coordinate movement and adapt to changing sensory cues.',
      spaceflight: 'Microgravity changes the relationship between visual, vestibular and body-position cues. During adaptation, crew members may report disorientation, dizziness or motion-related discomfort. The experience varies by person and mission phase.',
      signals: ['Crew-reported dizziness or disorientation', 'Nausea or motion-discomfort self-report', 'Task timing, movement context, sleep and fatigue notes'],
      concerns: ['Dizziness / balance concern', 'Disorientation or motion discomfort', 'Nausea or another concern'],
      next: 'Record when the observation occurred and what activity was underway. For real or persistent symptoms, use the mission-approved reporting pathway and qualified crew-medical support.',
      boundary: 'This prototype does not perform neurological or vestibular tests, assess fitness for duty, identify a cause, or determine treatment.'
    },
    cardio: {
      title: 'Heart & cardiovascular system', intro: 'The cardiovascular system circulates blood and adapts to changes in posture, fluid distribution and workload.',
      purpose: 'Supports circulation and delivery of oxygen and nutrients throughout the body.',
      spaceflight: 'Fluid shifts and cardiovascular adaptation are important human-spaceflight research topics. A measurement should be interpreted with its timestamp, activity, posture, device and individual context.',
      signals: ['Heart rate from an approved wearable or pulse measurement', 'Blood pressure only when an approved mission device and protocol provide it', 'Activity, posture and measurement-quality context'],
      concerns: ['Heart-rate change noticed', 'Lightheadedness / posture-related concern', 'Other circulation question'],
      next: 'Check the timestamp, activity/posture context and sensor status. For real symptoms or persistent changes, follow the crew medical reporting procedure. Do not self-adjust medication or treatment.',
      boundary: 'The demo model uses synthetic heart-rate inputs. It does not analyse ECG, diagnose arrhythmia, calculate cardiovascular risk, or set astronaut-safe limits.'
    },
    respiratory: {
      title: 'Lungs & respiratory system', intro: 'The respiratory system supports ventilation and gas exchange. Measurements depend on approved equipment and protocol.',
      purpose: 'Moves air and supports oxygen and carbon-dioxide exchange between the lungs and circulation.',
      spaceflight: 'Respiratory observations need the mission environment, device type, timing and measurement quality. A simulated dashboard value is not a clinical threshold.',
      signals: ['Pulse-oximeter SpO₂ value when approved equipment is available', 'Respiratory rate from the approved measurement process', 'Crew-reported breathing discomfort and activity context'],
      concerns: ['Breathing discomfort', 'Breathing-rate change noticed', 'Other respiratory question'],
      next: 'Confirm the correct device and mission-approved measurement method. If a real crew member reports breathing difficulty or a concerning result, follow the mission medical escalation protocol.',
      boundary: 'This prototype does not diagnose respiratory disease, interpret a medical emergency, or provide treatment. It is not a medical alarm.'
    },
    musculoskeletal: {
      title: 'Bone, muscle & movement', intro: 'The musculoskeletal system supports posture, movement and mechanical loading of bones and muscles.',
      purpose: 'Supports movement, stability and the physical tasks required during a mission.',
      spaceflight: 'Altered gravity changes the mechanical loading experienced by bones and muscles. Spaceflight research examines countermeasures, physical performance and changes across mission timepoints.',
      signals: ['Completion of the exercise/countermeasure already assigned by the mission team', 'Crew-reported discomfort or task difficulty', 'Research measurements collected by qualified teams with method and timepoint metadata'],
      concerns: ['Muscle discomfort', 'Joint / bone discomfort', 'Movement or exercise-task difficulty'],
      next: 'Record the activity and task context, and log only countermeasures assigned by the mission team. Share real concerns through the qualified crew-medical process.',
      boundary: 'ASTRA-VITAL does not estimate bone density, muscle mass, strength or fracture risk. It cannot replace imaging, laboratory testing or a flight-surgeon assessment.'
    },
    immune: {
      title: 'Immune & metabolic research', intro: 'The immune and metabolic systems are studied through carefully collected samples, assays and timepoint-specific research.',
      purpose: 'Immune responses help defend the body; metabolic processes regulate how the body uses and stores energy.',
      spaceflight: 'NASA human-spaceflight studies investigate immune and metabolic changes. Study type, sample type, assay, units, collection timepoint and participant context matter when interpreting a dataset.',
      signals: ['Laboratory biomarker results from approved research datasets', 'Assay name, sample type, units and collection timepoint', 'Cohort and study metadata needed to interpret a measurement'],
      concerns: ['Explore a research / lab result', 'Understand immune-system research', 'Other metabolic-system question'],
      next: 'Preserve the assay, unit, collection-time and sample metadata. Research findings must be interpreted by qualified medical or research staff under the applicable protocol.',
      boundary: 'Serum biomarker panels are not wearable sensor streams. This application does not interpret lab results as clinical diagnoses or recommend medication.'
    },
    wellbeing: {
      title: 'Sleep & crew wellbeing', intro: 'Sleep, fatigue and self-reported wellbeing are whole-person domains that can be influenced by schedules, workload and the mission environment.',
      purpose: 'Supports recovery, attention, mood and the ability to carry out routine mission tasks.',
      spaceflight: 'Isolation, confinement, unusual light-dark schedules and workload can make sleep and behavioural-health support important mission considerations. Reports should be voluntary and handled respectfully.',
      signals: ['Sleep duration or validated sleep-device summaries', 'Voluntary mood and fatigue self-reports', 'Workload, schedule and personal context notes'],
      concerns: ['Sleep disruption', 'Fatigue / low energy', 'Mood, stress or wellbeing check-in'],
      next: 'Review schedule and workload context, use crew-support resources approved for the mission, and make a private supportive check-in available. Do not use gamification to pressure disclosure.',
      boundary: 'Self-reports are personal observations, not psychiatric assessments. XP and routine completion never represent a health score.'
    }
  };

  let activeBodyRegion = null;
  let activeBodyMode = 'overview';
  let selectedBodyConcern = '';

  function renderBodyInfo() {
    const item = BODY_INFO[activeBodyRegion];
    const empty = $('#bodyInfoEmpty');
    const tabs = $('#bodyInfoTabs');
    const content = $('#bodyInfoContent');
    if (!item) {
      $('#bodyInfoTitle').textContent = 'Choose a body system';
      $('#bodyInfoIntro').textContent = 'Select a named anatomical pointer on the interactive 3D anatomy model. ASTRA-VITAL will explain the system and show what you can explore.';
      $('#bodySelectedTag').textContent = 'AWAITING SELECTION';
      empty.hidden = false; tabs.hidden = true; content.hidden = true;
      return;
    }
    empty.hidden = true; tabs.hidden = false; content.hidden = false;
    $('#bodyInfoTitle').textContent = item.title;
    $('#bodyInfoIntro').textContent = item.intro;
    $('#bodySelectedTag').textContent = 'SYSTEM SELECTED';
    $$('[data-body-mode]').forEach(btn => {
      const selected = btn.dataset.bodyMode === activeBodyMode;
      btn.classList.toggle('active', selected);
      btn.setAttribute('aria-selected', String(selected));
    });

    if (activeBodyMode === 'overview') {
      content.innerHTML = `
        <div class="body-info-block body-info-block-v2"><span class="body-block-kicker">SYSTEM FUNCTION</span><p>${escapeHtml(item.purpose)}</p></div>
        <div class="body-info-block body-info-block-v2"><span class="body-block-kicker">OBSERVATIONS THAT MAY BE RELEVANT</span><ul>${item.signals.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul></div>
        <div class="body-info-action-v2"><strong>How to use this panel</strong><p>Open <b>Spaceflight</b> for mission context, or <b>My concern</b> to choose a practice topic and send it to the simulated assessment note.</p></div>
        <div class="body-info-boundary"><strong>System boundary</strong><p>${escapeHtml(item.boundary)}</p></div>`;
    } else if (activeBodyMode === 'spaceflight') {
      content.innerHTML = `
        <div class="body-info-block body-info-block-v2"><span class="body-block-kicker">WHY THIS SYSTEM MATTERS IN SPACE</span><p>${escapeHtml(item.spaceflight)}</p></div>
        <div class="body-info-block body-info-block-v2"><span class="body-block-kicker">CONTEXT TO RECORD</span><ul><li>Mission phase and environment</li><li>Measurement time, device and signal quality</li><li>Activity, posture or schedule context where relevant</li><li>Use the assigned crew medical measurement protocol</li></ul></div>
        <div class="body-info-boundary"><strong>Interpretation boundary</strong><p>${escapeHtml(item.boundary)}</p></div>`;
    } else {
      const choices = item.concerns.map(option => `<button type="button" class="body-concern-choice ${selectedBodyConcern === option ? 'selected' : ''}" data-body-concern="${escapeHtml(option)}" aria-pressed="${selectedBodyConcern === option}"><span class="choice-radio"></span><span>${escapeHtml(option)}</span></button>`).join('');
      content.innerHTML = `
        <div class="body-concern-intro"><span class="body-block-kicker">CREW-LED TOPIC SELECTION</span><strong>What would you like to note?</strong><p>Choose a topic for a fictional practice scenario. This does not create a diagnosis or medical record.</p></div>
        <div class="body-concern-options">${choices}</div>
        <div class="body-concern-submit"><button type="button" class="button button-primary full-button" id="sendBodyConcern" ${selectedBodyConcern ? '' : 'disabled'}>Add topic to simulated assessment →</button><small>The selected topic is added to the demo context field only. No sensor values are changed.</small></div>
        <div class="body-info-boundary"><strong>For real crew concerns</strong><p>${escapeHtml(item.next)}</p></div>`;
    }
  }

  function selectBodyRegion(key) {
    if (!BODY_INFO[key]) return;
    activeBodyRegion = key;
    activeBodyMode = 'overview';
    selectedBodyConcern = '';
    $$('.body-hotspot').forEach(el => {
      const selected = el.dataset.region === key;
      el.classList.toggle('selected', selected);
      el.setAttribute('aria-pressed', String(selected));
    });
    $$('.body-region-chip').forEach(el => {
      const selected = el.dataset.region === key;
      el.classList.toggle('selected', selected);
      el.setAttribute('aria-pressed', String(selected));
    });
    renderBodyInfo();
  }

  // Shared with the switchable anatomy-view overlay, while keeping BODY_INFO private.
  window.AstraBodySelect = selectBodyRegion;
  window.AstraBodySelectReset = () => {
    activeBodyRegion = null; activeBodyMode = 'overview'; selectedBodyConcern = '';
    $$('.body-hotspot, .body-region-chip').forEach(el => { el.classList.remove('selected'); el.setAttribute('aria-pressed', 'false'); });
    renderBodyInfo();
  };

  function addBodyConcernToAssessment() {
    const item = BODY_INFO[activeBodyRegion];
    if (!item || !selectedBodyConcern) return;
    const field = $('#sensorContext');
    if (!field) return;
    const note = `Practice topic selected from anatomy explorer: ${item.title} — ${selectedBodyConcern}. Synthetic educational prompt only; not a real crew medical record.`;
    field.value = field.value ? `${field.value} | ${note}` : note;
    const assessmentNav = document.querySelector('.nav-item[data-view="assessment"]');
    if (assessmentNav) assessmentNav.click();
    window.setTimeout(() => { field.scrollIntoView({ behavior: 'smooth', block: 'center' }); field.focus(); }, 180);
    showToast('Practice topic added to the simulated assessment context. Sensor values were not changed.');
  }

  const ROUTINE_KEY = 'astra-vital-routine-v1';
  const TASKS = ['device', 'measure', 'sleep', 'wellbeing', 'countermeasure', 'review'];
  function readRoutine() {
    try { return JSON.parse(localStorage.getItem(ROUTINE_KEY) || '{}'); } catch (_) { return {}; }
  }
  function routineDate() { return new Date().toISOString().slice(0, 10); }
  function routineDayState(all, day) { return all[day] || {}; }
  function renderRoutine() {
    const all = readRoutine(); const today = routineDate(); const entry = routineDayState(all, today);
    let completedToday = 0;
    TASKS.forEach(task => { const box = document.querySelector(`[data-routine-task="${task}"]`); box.checked = !!entry[task]; box.closest('.routine-task').classList.toggle('completed', box.checked); if (box.checked) completedToday++; });
    const dayKeys = Object.keys(all).sort();
    const total = dayKeys.reduce((sum, day) => sum + TASKS.filter(task => all[day] && all[day][task]).length, 0);
    const xp = total * 10;
    const doneDays = new Set(dayKeys.filter(day => TASKS.some(task => all[day] && all[day][task])));
    let streak = 0; const start = new Date(`${today}T00:00:00`);
    for (let i = 0; i < 365; i++) { const d = new Date(start); d.setDate(d.getDate() - i); const key = d.toISOString().slice(0, 10); if (doneDays.has(key)) streak++; else if (i > 0) break; }
    $('#routineXp').textContent = `${String(xp).padStart(3, '0')} XP`;
    $('#routineProgressText').textContent = `${completedToday} / ${TASKS.length}`;
    $('#routineProgressBar').style.width = `${(completedToday / TASKS.length) * 100}%`;
    $('#routineProgressCaption').textContent = completedToday === TASKS.length ? 'Routine checklist complete. Points reflect workflow completion only.' : `${TASKS.length - completedToday} optional task(s) remain in today's mission log.`;
    $('#routineStreak').textContent = `${streak} ${streak === 1 ? 'day' : 'days'}`;
  }
  function setRoutineTask(task, checked) {
    const all = readRoutine(); const today = routineDate(); all[today] = all[today] || {};
    all[today][task] = checked;
    try { localStorage.setItem(ROUTINE_KEY, JSON.stringify(all)); } catch (_) { /* routine points are optional */ }
    renderRoutine();
  }

  function renderModelCard() {
    if (!MODEL) return;
    $('#modelAccuracy').textContent = `${(MODEL.meta.test_accuracy * 100).toFixed(1)}%`;
    $('#modelMacroF1').textContent = Number(MODEL.meta.test_macro_f1).toFixed(3);
    const map = {
      heart_rate_bpm: 'Heart rate', spo2_pct: 'Oxygen saturation', resp_rate_min: 'Respiratory rate', temperature_c: 'Temperature',
      sleep_hours: 'Sleep duration', fatigue_1_5: 'Fatigue self-report', mood_1_5: 'Mood self-report',
      dizziness_0_1: 'Dizziness flag', breathlessness_0_1: 'Breathlessness flag', nausea_0_1: 'Nausea flag'
    };
    const items = Object.entries(MODEL.meta.feature_importance).sort((a,b) => b[1]-a[1]);
    $('#featureImportanceBars').innerHTML = items.map(([key,value]) => `<div class="feature-row"><div><span>${map[key] || key}</span><b>${(value*100).toFixed(1)}%</b></div><div class="probability-track"><i style="width:${(value*100).toFixed(1)}%"></i></div></div>`).join('');
  }

  function loadScenario(kind) {
    const routine = { sensorHr: 67, sensorSpo2: 98.4, sensorResp: 15, sensorTemp: 36.7, sensorSleep: 7.8, sensorFatigue: 2, sensorMood: 4, sensorDizziness: 0, sensorBreathlessness: 0, sensorNausea: 0, signalQuality: 'good' };
    const mixed = { sensorHr: 104, sensorSpo2: 93.8, sensorResp: 24, sensorTemp: 37.4, sensorSleep: 5.7, sensorFatigue: 4, sensorMood: 2, sensorDizziness: 1, sensorBreathlessness: 0, sensorNausea: 1, signalQuality: 'good' };
    const values = kind === 'routine' ? routine : mixed;
    Object.entries(values).forEach(([id, value]) => { const el = document.getElementById(id); if (el) el.value = value; });
    $('#sensorContext').value = kind === 'routine' ? 'Synthetic routine-like scenario for model demonstration.' : 'Synthetic mixed-signal scenario for model demonstration.';
    showToast(`${kind === 'routine' ? 'Routine-like' : 'Mixed-signal'} synthetic scenario loaded.`);
  }
  function showToast(message) {
    const toast = $('#toast'); if (!toast) return;
    toast.textContent = message; toast.classList.add('show');
    window.clearTimeout(window.__missionToast); window.__missionToast = window.setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function init() {
    if (!$('#runScenarioModel')) return;
    $('#runScenarioModel').addEventListener('click', runModel);
    $('#loadRoutineScenario').addEventListener('click', () => loadScenario('routine'));
    $('#loadComplexScenario').addEventListener('click', () => loadScenario('mixed'));
    $('#missionEnvironment').addEventListener('change', updateEnvironment);
    updateEnvironment(); renderModelCard(); renderRoutine(); renderAssessmentLog();
    $('#modelResultPanel').addEventListener('click', event => { if (event.target.closest('#saveAssessmentScenario')) saveAssessmentScenario(); });
    $('#exportAssessmentHistory')?.addEventListener('click', exportAssessmentLog);
    $$('.body-hotspot').forEach(el => {
      el.addEventListener('click', () => selectBodyRegion(el.dataset.region));
      el.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); selectBodyRegion(el.dataset.region); } });
    });
    $$('.body-region-chip').forEach(el => el.addEventListener('click', () => selectBodyRegion(el.dataset.region)));
    $('#bodyInfoTabs')?.addEventListener('click', event => {
      const button = event.target.closest('[data-body-mode]');
      if (!button || !activeBodyRegion) return;
      activeBodyMode = button.dataset.bodyMode;
      if (activeBodyMode !== 'concern') selectedBodyConcern = '';
      renderBodyInfo();
    });
    $('#bodyInfoContent')?.addEventListener('click', event => {
      const choice = event.target.closest('[data-body-concern]');
      if (choice) {
        selectedBodyConcern = choice.dataset.bodyConcern;
        renderBodyInfo();
        return;
      }
      if (event.target.closest('#sendBodyConcern')) addBodyConcernToAssessment();
    });
    renderBodyInfo();
    $$('[data-routine-task]').forEach(box => box.addEventListener('change', () => setRoutineTask(box.dataset.routineTask, box.checked)));
    $('#routineReset')?.addEventListener('click', () => { const all = readRoutine(); delete all[routineDate()]; localStorage.setItem(ROUTINE_KEY, JSON.stringify(all)); renderRoutine(); });
  }
  document.addEventListener('DOMContentLoaded', init);
})();
