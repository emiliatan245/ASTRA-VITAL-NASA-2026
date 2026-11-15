/* ASTRA-VITAL Evidence Lab v0.3
   Local-only CSV/TSV analysis for files selected by the participant.
   Files are never uploaded. Imported files are not independently authenticated.
*/
(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const MAX_FILE_BYTES = 25 * 1024 * 1024;
  const MAX_ROWS = 250000;
  let rawText = '';
  let fileHash = 'Unavailable';
  let parsedDataset = null;
  let lastAnalysis = null;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    window.clearTimeout(window.__evidenceToastTimer);
    window.__evidenceToastTimer = window.setTimeout(() => el.classList.remove('show'), 3000);
  }

  function detectDelimiter(text) {
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim()).slice(0, 8);
    const candidates = [',', '\t', ';'];
    const countUnquoted = (line, delimiter) => {
      let quoted = false, count = 0;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          if (quoted && line[i + 1] === '"') i++;
          else quoted = !quoted;
        } else if (line[i] === delimiter && !quoted) count++;
      }
      return count;
    };
    return candidates.sort((a, b) => {
      const scoreA = lines.reduce((sum, line) => sum + countUnquoted(line, a), 0);
      const scoreB = lines.reduce((sum, line) => sum + countUnquoted(line, b), 0);
      return scoreB - scoreA;
    })[0];
  }

  function parseDelimited(text, delimiter) {
    const rows = [];
    let row = [], cell = '', quoted = false;
    const input = text.replace(/^\uFEFF/, '');
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (ch === '"') {
        if (quoted && input[i + 1] === '"') { cell += '"'; i++; }
        else quoted = !quoted;
      } else if (ch === delimiter && !quoted) {
        row.push(cell); cell = '';
      } else if ((ch === '\n' || ch === '\r') && !quoted) {
        if (ch === '\r' && input[i + 1] === '\n') i++;
        row.push(cell); cell = '';
        if (row.some(value => String(value).trim() !== '')) rows.push(row);
        row = [];
        if (rows.length > MAX_ROWS + 50) throw new Error(`File has more than ${MAX_ROWS.toLocaleString()} rows. Choose a smaller file or filter it first.`);
      } else {
        cell += ch;
      }
    }
    row.push(cell);
    if (row.some(value => String(value).trim() !== '')) rows.push(row);
    return rows;
  }

  function numericValue(value) {
    if (value === null || value === undefined) return NaN;
    const clean = String(value).trim().replace(/,/g, '').replace(/^[<>]=?\s*/, '');
    if (!clean || /^(na|n\/a|nan|null|none|not available|missing)$/i.test(clean)) return NaN;
    const number = Number(clean);
    return Number.isFinite(number) ? number : NaN;
  }

  function setStatus(message, isError = false) {
    const status = $('#importStatus');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('error-text', isError);
  }

  async function sha256Hex(buffer) {
    try {
      if (!window.crypto || !window.crypto.subtle) return 'Unavailable in this browser context';
      const digest = await window.crypto.subtle.digest('SHA-256', buffer);
      return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      return 'Unavailable in this browser context';
    }
  }

  async function loadSelectedFile() {
    const fileInput = $('#osdrDataFile');
    const analyzeButton = $('#analyzeOdsrFile');
    rawText = '';
    parsedDataset = null;
    lastAnalysis = null;
    fileHash = 'Unavailable';
    $('#importResults')?.classList.add('hidden');
    if ($('#importFileHash')) $('#importFileHash').textContent = '—';

    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      if (analyzeButton) analyzeButton.disabled = true;
      setStatus('No file selected.');
      return;
    }

    const file = fileInput.files[0];
    if (file.size > MAX_FILE_BYTES) {
      analyzeButton.disabled = true;
      setStatus('File exceeds 25 MB. Choose a smaller processed data file.', true);
      return;
    }

    analyzeButton.disabled = true;
    setStatus(`Reading ${file.name} locally and calculating a file fingerprint…`);
    try {
      const buffer = await file.arrayBuffer();
      rawText = new TextDecoder('utf-8').decode(buffer);
      fileHash = await sha256Hex(buffer);
      analyzeButton.disabled = false;
      setStatus(`${file.name} ready (${(file.size / 1024).toFixed(1)} KB). Click Analyse selected file.`);
    } catch (error) {
      rawText = '';
      analyzeButton.disabled = true;
      setStatus(error.message || 'The browser could not read this file. Try downloading it again.', true);
    }
  }

  function analyseSelectedFile() {
    if (!rawText) return setStatus('Choose a CSV or TSV file first.', true);
    const headerRow = Number($('#headerRowNumber').value);
    if (!Number.isInteger(headerRow) || headerRow < 1 || headerRow > 50) return setStatus('Header row must be between 1 and 50.', true);

    let rows;
    const delimiter = detectDelimiter(rawText);
    try {
      rows = parseDelimited(rawText, delimiter);
    } catch (error) {
      return setStatus(error.message || 'The file could not be parsed.', true);
    }

    const headerIndex = headerRow - 1;
    if (rows.length <= headerIndex + 1) return setStatus('Could not find a header and at least one data row. Try changing Header row number.', true);
    const headers = rows[headerIndex].map((value, index) => String(value || '').trim() || `Column ${index + 1}`);
    const dataRows = rows.slice(headerIndex + 1)
      .filter(row => row.some(value => String(value ?? '').trim() !== ''))
      .slice(0, MAX_ROWS)
      .map(row => headers.map((_, index) => row[index] ?? ''));
    if (headers.length < 2 || dataRows.length < 1) return setStatus('The selected header row does not appear to contain a data table.', true);

    parsedDataset = {
      fileName: $('#osdrDataFile').files[0].name,
      accession: ($('#sourceAccession').value.trim() || 'Unspecified source').toUpperCase(),
      license: $('#sourceLicense').value.trim() || 'Not recorded — verify on source page',
      units: $('#measureUnits').value.trim() || 'Not recorded',
      dictionaryNote: $('#dataDictionaryNote').value.trim() || 'Not provided',
      delimiter: delimiter === '\t' ? 'tab-separated' : delimiter === ';' ? 'semicolon-separated' : 'comma-separated',
      headers,
      rows: dataRows,
      hash: fileHash,
      importedAt: new Date().toISOString()
    };

    populateColumnSelectors();
    $('#importResults').classList.remove('hidden');
    $('#importFileName').textContent = parsedDataset.fileName;
    $('#importFileMeta').textContent = `${parsedDataset.accession} · ${dataRows.length.toLocaleString()} data rows · ${headers.length} columns · ${parsedDataset.delimiter}`;
    $('#importFileHash').textContent = parsedDataset.hash;
    $('#importProvenanceStatus').textContent = 'Participant-selected · not authenticated';
    setStatus('File parsed locally. No upload occurred. Review the column mapping and source metadata before interpreting results.');
    renderAnalysis();
    toast('Dataset parsed locally. Review units, missing values and timepoint mapping.');
  }

  function populateColumnSelectors() {
    const { headers, rows } = parsedDataset;
    const numericColumns = headers.map((header, index) => {
      const sample = rows.slice(0, 200).map(row => numericValue(row[index])).filter(Number.isFinite);
      return { header, index, count: sample.length };
    }).filter(column => column.count >= Math.max(2, Math.ceil(Math.min(rows.length, 10) * 0.3)));

    const measure = $('#measureColumn');
    measure.innerHTML = numericColumns.map(column => `<option value="${column.index}">${escapeHtml(column.header)} (${column.count} numeric sample values)</option>`).join('');
    if (!numericColumns.length) measure.innerHTML = '<option value="">No numeric columns detected</option>';

    const group = $('#groupColumn');
    const groupCandidates = headers.map((header, index) => ({ header, index })).filter(column => !numericColumns.some(n => n.index === column.index));
    const preferred = groupCandidates.find(column => /timepoint|time_point|sample|subject|source|time|date|visit|crew|participant|group|collection/i.test(column.header));
    group.innerHTML = '<option value="">Use row order</option>' + groupCandidates.map(column => `<option value="${column.index}" ${preferred && preferred.index === column.index ? 'selected' : ''}>${escapeHtml(column.header)}</option>`).join('');
  }

  function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function renderAnalysis() {
    if (!parsedDataset) return;
    const selectedMeasure = $('#measureColumn').value;
    const measureIndex = selectedMeasure === '' ? -1 : Number(selectedMeasure);
    if (!Number.isInteger(measureIndex) || measureIndex < 0 || !parsedDataset.headers[measureIndex]) {
      $('#importMetrics').innerHTML = '<p class="muted-copy">No numeric measure was detected. Check the header row or select another file.</p>';
      $('#importBars').innerHTML = '';
      lastAnalysis = null;
      return;
    }

    const values = [];
    let missing = 0, sum = 0, min = Infinity, max = -Infinity;
    parsedDataset.rows.forEach(row => {
      const value = numericValue(row[measureIndex]);
      if (!Number.isFinite(value)) { missing++; return; }
      values.push(value); sum += value;
      if (value < min) min = value;
      if (value > max) max = value;
    });
    const mean = values.length ? sum / values.length : NaN;
    const med = values.length ? median(values) : NaN;
    const completeness = parsedDataset.rows.length ? (values.length / parsedDataset.rows.length) * 100 : 0;

    const groupIndexValue = $('#groupColumn').value;
    const groupIndex = groupIndexValue === '' ? -1 : Number(groupIndexValue);
    const groups = new Map();
    parsedDataset.rows.forEach((row, index) => {
      const value = numericValue(row[measureIndex]);
      if (!Number.isFinite(value)) return;
      const label = groupIndex < 0 ? `Row ${index + 1}` : String(row[groupIndex] || 'Unlabelled').trim();
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(value);
    });
    const allGroupPoints = [...groups.entries()].map(([label, groupValues]) => ({
      label,
      value: groupValues.reduce((a, b) => a + b, 0) / groupValues.length,
      count: groupValues.length
    }));
    const displayPoints = allGroupPoints.slice(0, groupIndex < 0 ? 16 : 30);

    parsedDataset.units = $('#measureUnits').value.trim() || 'Not recorded';
    parsedDataset.license = $('#sourceLicense').value.trim() || 'Not recorded — verify on source page';
    parsedDataset.dictionaryNote = $('#dataDictionaryNote').value.trim() || 'Not provided';
    lastAnalysis = {
      measure: parsedDataset.headers[measureIndex],
      measureIndex,
      groupColumn: groupIndex < 0 ? 'Row order' : parsedDataset.headers[groupIndex],
      valid: values.length,
      missing,
      completeness,
      mean,
      median: med,
      min: values.length ? min : NaN,
      max: values.length ? max : NaN,
      points: allGroupPoints
    };

    $('#importMetrics').innerHTML = [
      ['VALID NUMERIC VALUES', values.length.toLocaleString()],
      ['MISSING / NON-NUMERIC', missing.toLocaleString()],
      ['MEASUREMENT COMPLETENESS', `${completeness.toFixed(1)}%`],
      ['MEAN', Number.isFinite(mean) ? mean.toPrecision(5) : '—'],
      ['MEDIAN', Number.isFinite(med) ? med.toPrecision(5) : '—'],
      ['MIN / MAX', values.length ? `${min.toPrecision(4)} / ${max.toPrecision(4)}` : '—']
    ].map(([label, value]) => `<div class="import-metric"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join('');

    $('#importChartTitle').textContent = `${parsedDataset.headers[measureIndex]}${parsedDataset.units !== 'Not recorded' ? ` · ${parsedDataset.units}` : ''}`;
    const span = Number.isFinite(max - min) && max !== min ? max - min : 1;
    $('#importBars').innerHTML = displayPoints.length ? displayPoints.map(point => {
      const width = Math.max(3, Math.min(100, ((point.value - min) / span) * 92 + 8));
      return `<div class="import-bar-row"><span class="import-bar-label" title="${escapeHtml(point.label)}">${escapeHtml(point.label)}</span><div class="import-bar-track"><i style="width:${width.toFixed(1)}%"></i></div><b>${escapeHtml(point.value.toPrecision(5))}</b><small>n=${point.count}</small></div>`;
    }).join('') : '<p class="muted-copy">No plottable values for this selection.</p>';

    const previewHeaders = parsedDataset.headers.slice(0, 8);
    $('#importTableHead').innerHTML = `<tr>${previewHeaders.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr>`;
    $('#importTableBody').innerHTML = parsedDataset.rows.slice(0, 12).map(row => `<tr>${previewHeaders.map((_, index) => `<td>${escapeHtml(row[index] ?? '')}</td>`).join('')}</tr>`).join('');
    $('#downloadAnalysisReport').disabled = false;
    $('#downloadGroupSummary').disabled = false;
  }

  function downloadText(filename, content, mime = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function safeFilePart(value) {
    return String(value || 'dataset').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'dataset';
  }

  function buildReport() {
    if (!parsedDataset || !lastAnalysis) return '';
    const a = lastAnalysis, d = parsedDataset;
    const fmt = value => Number.isFinite(value) ? value.toPrecision(7) : 'Not available';
    const reportPoints = a.points.slice(0, 100);
    const groupRows = reportPoints.map(point => `| ${String(point.label).replace(/\|/g, '\\|')} | ${fmt(point.value)} | ${point.count} |`).join('\n');
    return `# ASTRA-VITAL — Local Dataset Analysis Report\n\n` +
      `- Generated: ${new Date().toISOString()}\n` +
      `- Source accession entered by participant: ${d.accession}\n` +
      `- File: ${d.fileName}\n` +
      `- File SHA-256: ${d.hash}\n` +
      `- Licence entered by participant: ${d.license}\n` +
      `- Selected measure: ${a.measure}\n` +
      `- Units entered by participant: ${d.units}\n` +
      `- Data dictionary note: ${d.dictionaryNote}\n` +
      `- Grouping column: ${a.groupColumn}\n` +
      `- Rows analysed: ${d.rows.length}\n` +
      `- Columns detected: ${d.headers.length}\n\n` +
      `## Descriptive statistics\n\n` +
      `| Metric | Value |\n|---|---:|\n` +
      `| Valid numeric values | ${a.valid} |\n| Missing/non-numeric values | ${a.missing} |\n` +
      `| Measurement completeness | ${a.completeness.toFixed(1)}% |\n| Mean | ${fmt(a.mean)} |\n` +
      `| Median | ${fmt(a.median)} |\n| Minimum | ${fmt(a.min)} |\n| Maximum | ${fmt(a.max)} |\n\n` +
      `## Group summary\n\n| Group | Mean | n |\n|---|---:|---:|\n${groupRows || '| No groups | — | 0 |'}\n\n` +
      `${a.points.length > reportPoints.length ? `The Markdown report displays the first ${reportPoints.length} groups; the grouped-summary CSV contains all ${a.points.length} groups.\n\n` : ''}` +
      `## Provenance and limitations\n\n` +
      `This file was selected and analysed locally by the participant. ASTRA-VITAL does not upload the file. The source accession, licence and units above are user-entered metadata and have not been independently authenticated by this application. The SHA-256 value fingerprints the selected file but does not prove source authenticity. Statistics are descriptive only; they do not establish causality, clinical significance, diagnosis or astronaut safety thresholds. Verify the source study, data dictionary, sample population, collection timepoints, transformations, units, access conditions and licence before interpreting or publishing results.\n`;
  }

  function downloadAnalysisReport() {
    const report = buildReport();
    if (!report) return setStatus('Analyse a file before downloading a report.', true);
    downloadText(`${safeFilePart(parsedDataset.accession)}_analysis_report.md`, report, 'text/markdown;charset=utf-8');
    toast('Reproducibility report downloaded. Review metadata before submission.');
  }

  function csvCell(value) {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  }

  function downloadGroupSummary() {
    if (!parsedDataset || !lastAnalysis) return setStatus('Analyse a file before downloading a grouped summary.', true);
    const rows = [
      ['group', 'measure', 'units', 'mean', 'n', 'source_accession', 'source_file'],
      ...lastAnalysis.points.map(point => [point.label, lastAnalysis.measure, parsedDataset.units, point.value, point.count, parsedDataset.accession, parsedDataset.fileName])
    ];
    const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
    downloadText(`${safeFilePart(parsedDataset.accession)}_group_summary.csv`, csv, 'text/csv;charset=utf-8');
    toast('Grouped summary CSV downloaded.');
  }

  function clearImportedDataset() {
    rawText = '';
    parsedDataset = null;
    lastAnalysis = null;
    fileHash = 'Unavailable';
    $('#osdrDataFile').value = '';
    $('#analyzeOdsrFile').disabled = true;
    $('#importResults').classList.add('hidden');
    $('#importFileHash').textContent = '—';
    setStatus('Imported file cleared from this page. No source file was uploaded.');
  }

  function init() {
    const fileInput = $('#osdrDataFile');
    if (!fileInput) return;
    fileInput.addEventListener('change', loadSelectedFile);
    $('#analyzeOdsrFile').addEventListener('click', analyseSelectedFile);
    $('#measureColumn').addEventListener('change', renderAnalysis);
    $('#groupColumn').addEventListener('change', renderAnalysis);
    $('#headerRowNumber').addEventListener('change', () => {
      if (rawText) setStatus('Header row changed. Click Analyse selected file again to re-parse.');
    });
    $('#downloadAnalysisReport').addEventListener('click', downloadAnalysisReport);
    $('#downloadGroupSummary').addEventListener('click', downloadGroupSummary);
    $('#clearImportedDataset').addEventListener('click', clearImportedDataset);
    $('#downloadAnalysisReport').disabled = true;
    $('#downloadGroupSummary').disabled = true;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
