/* ASTRA-VITAL v0.3.0
   Educational prototype. Demo observations are synthetic, not astronaut medical data.
   Prototype rules are trend-review prompts only; they are not medical thresholds.
*/
(() => {
  'use strict';
  const STORAGE_KEY = 'astra-vital-v2';
  const LEGACY_STORAGE_KEY = 'astra-vital-v1';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const demoData = {
    baseline: { heartRate: 66, sleep: 8.0 },
    reviewRules: { heartRatePercent: 15, sleepHours: 1, consecutiveEntries: 2 },
    entries: [
      { date: '2026-11-08', heartRate: 65, sleep: 8.1, mood: 4, fatigue: 2, note: 'Synthetic demo observation' },
      { date: '2026-11-09', heartRate: 67, sleep: 7.8, mood: 4, fatigue: 2, note: 'Synthetic demo observation' },
      { date: '2026-11-10', heartRate: 66, sleep: 8.2, mood: 3, fatigue: 2, note: 'Synthetic demo observation' },
      { date: '2026-11-11', heartRate: 68, sleep: 7.6, mood: 3, fatigue: 3, note: 'Synthetic demo observation' },
      { date: '2026-11-12', heartRate: 67, sleep: 7.9, mood: 4, fatigue: 2, note: 'Synthetic demo observation' },
      { date: '2026-11-13', heartRate: 69, sleep: 7.5, mood: 3, fatigue: 2, note: 'Synthetic demo observation' },
      { date: '2026-11-14', heartRate: 68, sleep: 7.4, mood: 3, fatigue: 2, note: 'Synthetic demo observation' }
    ]
  };

  let state = loadState();
  let toastTimer;

  function loadState() {
    try {
      // Migrate existing v0.1 records without discarding the participant's local test entry.
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!saved) return structuredClone(demoData);
      const parsed = JSON.parse(saved);
      if (!parsed || !Array.isArray(parsed.entries) || !parsed.baseline) return structuredClone(demoData);
      parsed.entries = parsed.entries.map(entry => ({
        ...entry,
        context: typeof entry.context === 'string' && entry.context ? entry.context : 'Not recorded'
      }));
      parsed.reviewRules = { ...demoData.reviewRules, ...(parsed.reviewRules || {}) };
      return parsed;
    } catch (error) {
      console.warn('Could not load local ASTRA-VITAL records; using demo data.', error);
      return structuredClone(demoData);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Local save unavailable.', error);
      showToast('Could not save in this browser. Export your CSV to keep a copy.');
    }
  }

  function sortedEntries() {
    return [...state.entries].sort((a, b) => a.date.localeCompare(b.date));
  }

  function latestEntry() {
    const entries = sortedEntries();
    return entries[entries.length - 1] || null;
  }

  function formatDate(iso) {
    const date = new Date(`${iso}T00:00:00`);
    return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function updateClock() {
    const now = new Date();
    $('#utcClock').textContent = `${now.toISOString().slice(11, 19)} UTC`;
  }

  function setMissionDay() {
    const latest = latestEntry();
    const first = sortedEntries()[0];
    if (!latest || !first) return;
    const elapsed = Math.max(1, Math.round((new Date(`${latest.date}T00:00:00`) - new Date(`${first.date}T00:00:00`)) / 86400000) + 34);
    $('#missionDay').textContent = String(elapsed).padStart(3, '0');
  }

  function sparkline(values, color) {
    const width = 180, height = 25, pad = 2;
    if (!values.length) return '';
    const min = Math.min(...values), max = Math.max(...values);
    const range = max - min || 1;
    const points = values.map((value, index) => {
      const x = pad + (index / Math.max(1, values.length - 1)) * (width - pad * 2);
      const y = height - pad - ((value - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/></svg>`;
  }

  function ratingDots(value, selector) {
    $(selector).innerHTML = Array.from({ length: 5 }, (_, i) => `<i class="${i < value ? 'filled' : ''}"></i>`).join('');
  }

  function getAlerts() {
    const entries = sortedEntries();
    const latest = entries.at(-1);
    if (!latest) return [];
    const rules = { ...demoData.reviewRules, ...(state.reviewRules || {}) };
    const recent = entries.slice(-rules.consecutiveEntries);
    const alerts = [];
    const baselineHr = Number(state.baseline.heartRate);
    const baselineSleep = Number(state.baseline.sleep);
    const hrThreshold = rules.heartRatePercent / 100;
    const hasSustainedHrDeviation = recent.length >= rules.consecutiveEntries && recent.every(entry =>
      Math.abs(Number(entry.heartRate) - baselineHr) / Math.max(1, baselineHr) > hrThreshold
    );
    if (hasSustainedHrDeviation) {
      alerts.push({
        title: 'Resting heart-rate trend changed',
        body: `${recent.length} consecutive entries are more than ${rules.heartRatePercent}% from the demo reference (${baselineHr} bpm). Latest context: ${latest.context || 'not recorded'}. This is an editable software-review rule, not a clinical threshold.`,
        action: 'Check the recorded context and measurement consistency. If this were an operational mission system, route persistent concerns to qualified flight-medical staff.',
        kind: 'review'
      });
    }
    const hasSustainedSleepDeviation = recent.length >= rules.consecutiveEntries && recent.every(entry =>
      Number(entry.sleep) <= baselineSleep - rules.sleepHours
    );
    if (hasSustainedSleepDeviation) {
      alerts.push({
        title: 'Sleep trend below personal reference',
        body: `${recent.length} consecutive entries are at least ${rules.sleepHours} hour(s) below the demo reference (${baselineSleep} h). Latest context: ${latest.context || 'not recorded'}. This is an editable software-review rule, not a clinical threshold.`,
        action: 'Review schedule, workload and crew-reported context. Record a follow-up observation and surface persistent concerns to crew support.',
        kind: 'review'
      });
    }
    if (Number(latest.fatigue) >= 4 || Number(latest.mood) <= 2) {
      alerts.push({
        title: 'Crew wellness check-in suggested',
        body: 'The latest self-reported mood or fatigue entry may warrant a supportive check-in. This is not a diagnosis.',
        action: 'Offer a private, supportive conversation and make crew-wellness resources easy to reach. Do not infer a diagnosis from a single rating.',
        kind: 'wellness'
      });
    }
    return alerts;
  }

  function renderAlerts() {
    const alerts = getAlerts();
    $('#queueCount').textContent = alerts.length;
    $('#alertList').innerHTML = alerts.length ? alerts.map(alert => `
      <div class="alert-item"><span class="alert-mark" style="background:${alert.kind === 'wellness' ? 'var(--violet)' : 'var(--amber)'}"></span><div><span class="alert-category">${alert.kind === 'wellness' ? 'WELLNESS FOLLOW-UP' : 'TREND REVIEW'}</span><strong>${escapeHtml(alert.title)}</strong><p>${escapeHtml(alert.body)}</p><div class="alert-action"><b>Suggested review:</b> ${escapeHtml(alert.action)}</div></div></div>`).join('') : '<div class="alert-empty">✓ No prototype review prompts from the latest demo entries. A clear queue does not establish medical fitness or absence of risk.</div>';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function renderDataIntegrity() {
    const entries = sortedEntries();
    const fields = ['date', 'heartRate', 'sleep', 'mood', 'fatigue'];
    const expected = entries.length * fields.length;
    const present = entries.reduce((total, entry) => total + fields.filter(key => entry[key] !== undefined && entry[key] !== null && entry[key] !== '').length, 0);
    const completeness = expected ? Math.round((present / expected) * 100) : 0;
    const latest = entries.at(-1);
    const quality = $('#dataCompleteness');
    const latestDate = $('#latestRecordDate');
    const recordTotal = $('#dataRecordTotal');
    if (quality) quality.textContent = `${completeness}%`;
    if (latestDate) latestDate.textContent = latest ? formatDate(latest.date) : '—';
    if (recordTotal) recordTotal.textContent = String(entries.length).padStart(2, '0');
  }

  function renderOverview() {
    const entries = sortedEntries();
    const latest = entries.at(-1);
    if (!latest) return;
    $('#metricHr').textContent = latest.heartRate;
    $('#metricSleep').textContent = Number(latest.sleep).toFixed(1);
    $('#metricMood').textContent = latest.mood;
    $('#metricFatigue').textContent = latest.fatigue;
    $('#hrBaselineLabel').textContent = `${state.baseline.heartRate} bpm`;
    $('#sleepTargetLabel').textContent = `${Number(state.baseline.sleep).toFixed(1)} h`;
    const delta = ((latest.heartRate - state.baseline.heartRate) / state.baseline.heartRate) * 100;
    $('#hrTag').textContent = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% VS REF`;
    $('#sleepTag').textContent = `${(latest.sleep - state.baseline.sleep) >= 0 ? '+' : ''}${(latest.sleep - state.baseline.sleep).toFixed(1)} H VS REF`;
    const last = entries.slice(-7);
    $('#hrSpark').innerHTML = sparkline(last.map(e => e.heartRate), '#5ce1e6');
    $('#sleepSpark').innerHTML = sparkline(last.map(e => e.sleep), '#b9a6ff');
    ratingDots(latest.mood, '#moodDots');
    ratingDots(latest.fatigue, '#fatigueDots');
    renderAlerts();
    drawChart('overviewHrChart', last.map(e => e.heartRate), last.map(e => formatDate(e.date)), { color: '#5ce1e6', baseline: Number(state.baseline.heartRate), suffix: ' bpm' });
    drawChart('overviewSleepChart', last.map(e => e.sleep), last.map(e => formatDate(e.date)), { color: '#b9a6ff', baseline: Number(state.baseline.sleep), suffix: ' h', compact: true });
    setMissionDay();
    $('#recordCount').textContent = String(entries.length).padStart(2, '0');
    renderDataIntegrity();
  }

  function drawChart(canvasId, values, labels, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(280, Math.floor(rect.width));
    const height = Number(canvas.getAttribute('height')) || 220;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const pad = { left: 37, right: 12, top: 15, bottom: 30 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    if (!values.length) return;
    const all = options.baseline === undefined ? [...values] : [...values, options.baseline];
    let min = Math.min(...all), max = Math.max(...all);
    const extra = (max - min || 1) * 0.24;
    min -= extra; max += extra;
    const y = v => pad.top + (max - v) / (max - min) * plotH;
    const x = i => pad.left + (i / Math.max(1, values.length - 1)) * plotW;
    ctx.font = '9px DM Mono, monospace';
    ctx.fillStyle = '#70879e';
    ctx.strokeStyle = 'rgba(151,181,211,.11)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const gy = pad.top + (plotH / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(width - pad.right, gy); ctx.stroke();
      const value = max - ((max - min) / 4) * i;
      ctx.fillText(value.toFixed(options.compact ? 1 : 0), 0, gy + 3);
    }
    if (options.baseline !== undefined) {
      const by = y(options.baseline);
      ctx.setLineDash([4, 5]); ctx.strokeStyle = 'rgba(155,179,201,.7)';
      ctx.beginPath(); ctx.moveTo(pad.left, by); ctx.lineTo(width - pad.right, by); ctx.stroke(); ctx.setLineDash([]);
    }
    const gradient = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
    gradient.addColorStop(0, `${options.color || '#5ce1e6'}33`);
    gradient.addColorStop(1, `${options.color || '#5ce1e6'}00`);
    ctx.beginPath();
    values.forEach((value, i) => i ? ctx.lineTo(x(i), y(value)) : ctx.moveTo(x(i), y(value)));
    ctx.lineTo(x(values.length - 1), height - pad.bottom); ctx.lineTo(x(0), height - pad.bottom); ctx.closePath();
    ctx.fillStyle = gradient; ctx.fill();
    ctx.beginPath();
    values.forEach((value, i) => i ? ctx.lineTo(x(i), y(value)) : ctx.moveTo(x(i), y(value)));
    ctx.strokeStyle = options.color || '#5ce1e6'; ctx.lineWidth = 2.1; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
    values.forEach((value, i) => { ctx.beginPath(); ctx.arc(x(i), y(value), 3, 0, Math.PI * 2); ctx.fillStyle = options.color || '#5ce1e6'; ctx.fill(); ctx.strokeStyle = '#0b1b2c'; ctx.lineWidth = 1.5; ctx.stroke(); });
    ctx.fillStyle = '#71889e';
    labels.forEach((label, i) => {
      const shouldDraw = labels.length <= 5 || i === 0 || i === labels.length - 1 || i % 2 === 0;
      if (shouldDraw) { ctx.textAlign = i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center'; ctx.fillText(label, x(i), height - 8); }
    });
  }

  function renderHistory() {
    const entries = sortedEntries().slice().reverse();
    $('#historyBody').innerHTML = entries.length ? entries.map(e => `<tr><td>${escapeHtml(formatDate(e.date))}</td><td>${e.heartRate} bpm</td><td>${Number(e.sleep).toFixed(1)} h</td><td>${e.mood}/5</td><td>${e.fatigue}/5</td><td>${escapeHtml(e.context || 'Not recorded')}</td><td>${escapeHtml(e.note || '—')}</td></tr>`).join('') : '<tr><td colspan="7" class="empty-row">No observations yet.</td></tr>';
  }

  function renderTrends() {
    const entries = sortedEntries();
    const last = entries.slice(-14);
    const labels = last.map(e => formatDate(e.date));
    drawChart('trendHrChart', last.map(e => e.heartRate), labels, { color: '#5ce1e6', baseline: Number(state.baseline.heartRate) });
    drawChart('trendSleepChart', last.map(e => e.sleep), labels, { color: '#b9a6ff', baseline: Number(state.baseline.sleep), compact: true });
    drawDualChart('trendWellnessChart', last);
  }

  function drawDualChart(canvasId, entries) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect(); if (!rect.width) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1), width = Math.max(280, Math.floor(rect.width)), height = Number(canvas.getAttribute('height')) || 280;
    canvas.width = width * dpr; canvas.height = height * dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    const pad = { left: 30, right: 12, top: 20, bottom: 30 }, plotW = width - pad.left - pad.right, plotH = height - pad.top - pad.bottom;
    const x = i => pad.left + (i / Math.max(1, entries.length - 1)) * plotW;
    const y = v => pad.top + ((5 - v) / 4) * plotH;
    ctx.font = '9px DM Mono, monospace'; ctx.fillStyle = '#70879e'; ctx.strokeStyle = 'rgba(151,181,211,.11)';
    for (let i = 1; i <= 5; i++) { const yy = y(i); ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(width - pad.right, yy); ctx.stroke(); ctx.fillText(String(i), 8, yy + 3); }
    [[ 'mood', '#b9a6ff'], ['fatigue', '#ff9bad']].forEach(([key, color]) => {
      ctx.beginPath(); entries.forEach((e, i) => i ? ctx.lineTo(x(i), y(e[key])) : ctx.moveTo(x(i), y(e[key]))); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
      entries.forEach((e, i) => { ctx.beginPath(); ctx.arc(x(i), y(e[key]), 3, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); });
    });
    ctx.fillStyle = '#71889e'; entries.forEach((e, i) => { ctx.textAlign = i === 0 ? 'left' : i === entries.length - 1 ? 'right' : 'center'; ctx.fillText(formatDate(e.date), x(i), height - 8); });
  }

  function renderAll() {
    renderOverview(); renderHistory(); renderTrends(); renderDataIntegrity();
    const rules = { ...demoData.reviewRules, ...(state.reviewRules || {}) };
    $('#baselineHr').value = state.baseline.heartRate;
    $('#baselineSleep').value = state.baseline.sleep;
    $('#hrDeviationPct').value = rules.heartRatePercent;
    $('#sleepDeviationHours').value = rules.sleepHours;
    $('#consecutiveEntries').value = rules.consecutiveEntries;
    $('#baselineRuleText').textContent = `Demo review rules: heart-rate deviation greater than ${rules.heartRatePercent}% from reference, or sleep at least ${rules.sleepHours} hour(s) below reference, across ${rules.consecutiveEntries} consecutive entries. These are editable prototype settings, not clinical or flight-medicine limits.`;
  }

  function navigate(viewName) {
    $$('.view').forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
    $$('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));
    $('#breadcrumbCurrent').textContent = viewName.replace('-', ' ').toUpperCase();
    $('#sidebar').classList.remove('open');
    if (viewName === 'overview' || viewName === 'trends') setTimeout(renderAll, 40);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exportCsv() {
    const rows = [['date', 'heart_rate_bpm', 'sleep_hours', 'mood_1_to_5', 'fatigue_1_to_5', 'mission_context', 'note'], ...sortedEntries().map(e => [e.date, e.heartRate, e.sleep, e.mood, e.fatigue, e.context || 'Not recorded', e.note || ''])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    downloadBlob(csv, 'astra-vital-observations.csv', 'text/csv;charset=utf-8');
    showToast('CSV export prepared. Keep the file somewhere safe.');
  }

  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename;
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  }

  function downloadReport() {
    const summary = [
      'ASTRA-VITAL — SYNTHETIC DEMONSTRATION DATA REPORT',
      'Educational prototype only. Not medical advice or a validated medical device.',
      `Demo heart-rate reference: ${state.baseline.heartRate} bpm`,
      `Demo sleep reference: ${state.baseline.sleep} hours`,
      '',
      'date,heart_rate_bpm,sleep_hours,mood_1_to_5,fatigue_1_to_5,mission_context,note',
      ...sortedEntries().map(e => [e.date, e.heartRate, e.sleep, e.mood, e.fatigue, e.context || 'Not recorded', e.note || ''].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    downloadBlob(summary, 'astra-vital-demo-report.txt', 'text/plain;charset=utf-8');
    showToast('Demo report downloaded.');
  }

  function init() {
    updateClock(); setInterval(updateClock, 1000);
    const today = new Date(); $('#entryDate').value = today.toISOString().slice(0, 10);
    renderAll();

    $$('.nav-item').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.view)));
    $$('[data-goto]').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.goto)));
    $('#mobileMenu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
    $('#dismissNotice').addEventListener('click', () => $('.notice-banner').classList.add('hidden'));
    $('#exportCsv').addEventListener('click', exportCsv);
    $('#resetDemo').addEventListener('click', () => {
      const confirmed = window.confirm('Reset all local observations and references to the original synthetic demo scenario? This removes check-ins you added in this browser.');
      if (!confirmed) return;
      state = structuredClone(demoData);
      saveState(); renderAll();
      $('#formFeedback').textContent = '';
      showToast('Original synthetic demo scenario restored.');
    });
    $('#downloadReport').addEventListener('click', downloadReport);
    $('#osdrSearchForm').addEventListener('submit', event => {
      event.preventDefault();
      const term = $('#osdrSearchTerm').value.trim();
      if (!term) return showToast('Enter a research topic to search NASA OSDR.');
      const url = `https://osdr.nasa.gov/bio/repo/search?q=${encodeURIComponent(term)}&data_source=cgene`;
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast('Opening NASA OSDR search in a new tab.');
    });

    $('#checkinForm').addEventListener('submit', event => {
      event.preventDefault();
      const record = {
        date: $('#entryDate').value,
        heartRate: Number($('#entryHr').value),
        sleep: Number($('#entrySleep').value),
        mood: Number($('#entryMood').value),
        fatigue: Number($('#entryFatigue').value),
        context: $('#entryContext').value,
        note: $('#entryNote').value.trim()
      };
      if (!record.date || !Number.isFinite(record.heartRate) || !Number.isFinite(record.sleep) || record.heartRate < 30 || record.heartRate > 220 || record.sleep < 0 || record.sleep > 24 || !Number.isInteger(record.mood) || record.mood < 1 || record.mood > 5 || !Number.isInteger(record.fatigue) || record.fatigue < 1 || record.fatigue > 5) {
        $('#formFeedback').textContent = 'Check the date and measurement fields. Values must be within the form limits.';
        return;
      }
      state.entries = state.entries.filter(e => e.date !== record.date);
      state.entries.push(record);
      saveState(); renderAll();
      $('#formFeedback').textContent = 'Observation saved locally. Synthetic/demo data is still clearly labelled.';
      showToast('Observation saved in this browser.');
      $('#entryNote').value = '';
      $('#entryContext').value = 'Routine day';
    });

    $('#baselineForm').addEventListener('submit', event => {
      event.preventDefault();
      const hr = Number($('#baselineHr').value), sleep = Number($('#baselineSleep').value);
      const hrPercent = Number($('#hrDeviationPct').value);
      const sleepHours = Number($('#sleepDeviationHours').value);
      const consecutive = Number($('#consecutiveEntries').value);
      if (!Number.isFinite(hr) || !Number.isFinite(sleep) || hr < 30 || hr > 220 || sleep < 0 || sleep > 24 ||
          !Number.isFinite(hrPercent) || hrPercent < 5 || hrPercent > 50 ||
          !Number.isFinite(sleepHours) || sleepHours < 0.5 || sleepHours > 4 ||
          !Number.isInteger(consecutive) || consecutive < 2 || consecutive > 5) {
        return showToast('Please check the reference and demo review-rule values.');
      }
      state.baseline = { heartRate: hr, sleep };
      state.reviewRules = { heartRatePercent: hrPercent, sleepHours, consecutiveEntries: consecutive };
      saveState(); renderAll(); showToast('Demo references and editable review rules updated.');
    });

    $('#checkinForm').addEventListener('reset', () => setTimeout(() => { $('#formFeedback').textContent = ''; }, 0));
    window.addEventListener('resize', () => { clearTimeout(window.__astraResize); window.__astraResize = setTimeout(renderAll, 120); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
