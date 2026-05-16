/**
 * Study Focus Analyzer — script.js
 * Vanilla JavaScript only. No frameworks, no build step.
 *
 * Features implemented:
 *  - Add / delete activities (name, duration, type)
 *  - Total Focus Time auto-update
 *  - Chart.js pie chart auto-update
 *  - Local Storage persistence
 *  - Custom categories (Optional Challenge 1)
 *  - Sort transactions (Optional Challenge 2)
 *  - Dark / Light mode toggle (Optional Challenge 3)
 */

/* ============================================================
   CONSTANTS & STATE
   ============================================================ */

const LS_ACTIVITIES   = 'sfa_activities';
const LS_CUSTOM_CATS  = 'sfa_custom_cats';
const LS_THEME        = 'sfa_theme';

/** Built-in activity types with their chart colours */
const BUILT_IN_TYPES = [
  { label: 'Deep Study',         color: '#4f46e5' },
  { label: 'Practice / Coding',  color: '#06b6d4' },
  { label: 'Distraction / Break',color: '#f59e0b' },
];

/** Palette for custom categories (cycles if more than 8 are added) */
const CUSTOM_COLORS = [
  '#10b981', '#ef4444', '#8b5cf6', '#ec4899',
  '#f97316', '#14b8a6', '#6366f1', '#84cc16',
];

/** Application state */
let activities   = [];   // { id, name, duration, type }
let customCats   = [];   // string[]
let sortMode     = 'default';
let chartInstance = null;

/* ============================================================
   DOM REFERENCES
   ============================================================ */

const form            = document.getElementById('activityForm');
const nameInput       = document.getElementById('activityName');
const durationInput   = document.getElementById('activityDuration');
const typeSelect      = document.getElementById('activityType');
const nameError       = document.getElementById('nameError');
const durationError   = document.getElementById('durationError');
const typeError       = document.getElementById('typeError');

const totalTimeEl     = document.getElementById('totalTime');
const activityListEl  = document.getElementById('activityList');
const listEmptyEl     = document.getElementById('listEmpty');
const chartEmptyEl    = document.getElementById('chartEmpty');
const chartCanvas     = document.getElementById('focusChart');

const sortControl     = document.getElementById('sortControl');
const themeToggle     = document.getElementById('themeToggle');
const themeIcon       = document.getElementById('themeIcon');

const customCatInput  = document.getElementById('customCatInput');
const addCustomCatBtn = document.getElementById('addCustomCat');
const customCatError  = document.getElementById('customCatError');
const customCatListEl = document.getElementById('customCatList');

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

/** Generate a simple unique ID */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Return the chart colour for a given activity type label */
function colorForType(typeLabel) {
  const builtin = BUILT_IN_TYPES.find(t => t.label === typeLabel);
  if (builtin) return builtin.color;
  const idx = customCats.indexOf(typeLabel);
  return CUSTOM_COLORS[idx % CUSTOM_COLORS.length] ?? '#94a3b8';
}

/* ============================================================
   LOCAL STORAGE
   ============================================================ */

function saveActivities() {
  localStorage.setItem(LS_ACTIVITIES, JSON.stringify(activities));
}

function loadActivities() {
  try {
    const raw = localStorage.getItem(LS_ACTIVITIES);
    activities = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(activities)) activities = [];
  } catch (err) {
    console.error('[StudyFocusAnalyzer] Failed to parse activities from Local Storage:', err);
    activities = [];
  }
}

function saveCustomCats() {
  localStorage.setItem(LS_CUSTOM_CATS, JSON.stringify(customCats));
}

function loadCustomCats() {
  try {
    const raw = localStorage.getItem(LS_CUSTOM_CATS);
    customCats = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(customCats)) customCats = [];
  } catch (err) {
    console.error('[StudyFocusAnalyzer] Failed to parse custom categories from Local Storage:', err);
    customCats = [];
  }
}

function saveTheme(theme) {
  localStorage.setItem(LS_THEME, theme);
}

function loadTheme() {
  return localStorage.getItem(LS_THEME) || 'light';
}

/* ============================================================
   THEME TOGGLE (Optional Challenge 3)
   ============================================================ */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  // Rebuild chart so colours adapt to the new theme background
  if (chartInstance) renderChart();
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  saveTheme(next);
});

/* ============================================================
   CUSTOM CATEGORIES (Optional Challenge 1)
   ============================================================ */

/** Rebuild the <select> options to include custom categories */
function syncTypeDropdown() {
  // Remove any previously injected custom options (keep the first 4: placeholder + 3 built-ins)
  while (typeSelect.options.length > 4) {
    typeSelect.remove(4);
  }
  customCats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = `🏷️ ${cat}`;
    typeSelect.appendChild(opt);
  });
}

/** Render the custom category tag list */
function renderCustomCatTags() {
  customCatListEl.innerHTML = '';
  customCats.forEach((cat, idx) => {
    const tag = document.createElement('span');
    tag.className = 'cat-tag';
    tag.innerHTML = `${cat} <button class="cat-tag-remove" data-idx="${idx}" aria-label="Remove ${cat}">×</button>`;
    customCatListEl.appendChild(tag);
  });
}

addCustomCatBtn.addEventListener('click', () => {
  const val = customCatInput.value.trim();
  customCatError.textContent = '';

  if (!val) {
    customCatError.textContent = 'Please enter a category name.';
    return;
  }

  const allTypes = BUILT_IN_TYPES.map(t => t.label.toLowerCase()).concat(customCats.map(c => c.toLowerCase()));
  if (allTypes.includes(val.toLowerCase())) {
    customCatError.textContent = 'This category already exists.';
    return;
  }

  customCats.push(val);
  saveCustomCats();
  syncTypeDropdown();
  renderCustomCatTags();
  customCatInput.value = '';
});

customCatListEl.addEventListener('click', e => {
  const btn = e.target.closest('.cat-tag-remove');
  if (!btn) return;
  const idx = parseInt(btn.dataset.idx, 10);
  const removed = customCats[idx];

  // Remove the category
  customCats.splice(idx, 1);
  saveCustomCats();
  syncTypeDropdown();
  renderCustomCatTags();

  // If any activities used this category, keep them but their colour will fall back gracefully
  // (no data loss — user's activities are preserved)
  renderChart();
});

/* ============================================================
   FORM VALIDATION & SUBMISSION
   ============================================================ */

function clearErrors() {
  nameError.textContent     = '';
  durationError.textContent = '';
  typeError.textContent     = '';
}

function validateForm() {
  let valid = true;
  clearErrors();

  if (!nameInput.value.trim()) {
    nameError.textContent = 'Activity name is required.';
    valid = false;
  }

  const dur = parseFloat(durationInput.value);
  if (!durationInput.value.trim() || isNaN(dur) || dur <= 0) {
    durationError.textContent = 'Enter a positive number of minutes.';
    valid = false;
  }

  if (!typeSelect.value) {
    typeError.textContent = 'Please select an activity type.';
    valid = false;
  }

  return valid;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) return;

  const activity = {
    id:       uid(),
    name:     nameInput.value.trim(),
    duration: parseFloat(durationInput.value),
    type:     typeSelect.value,
  };

  activities.push(activity);
  saveActivities();

  // Reset form
  nameInput.value     = '';
  durationInput.value = '';
  typeSelect.value    = '';
  clearErrors();

  updateUI();
});

/* ============================================================
   DELETE ACTIVITY
   ============================================================ */

activityListEl.addEventListener('click', e => {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;
  const id = btn.dataset.id;
  activities = activities.filter(a => a.id !== id);
  saveActivities();
  updateUI();
});

/* ============================================================
   SORT (Optional Challenge 2)
   ============================================================ */

sortControl.addEventListener('change', () => {
  sortMode = sortControl.value;
  renderActivityList();
});

/** Return a sorted copy of activities based on current sortMode */
function getSortedActivities() {
  const copy = [...activities];
  switch (sortMode) {
    case 'name':
      copy.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'duration':
      copy.sort((a, b) => b.duration - a.duration);
      break;
    case 'type':
      copy.sort((a, b) => a.type.localeCompare(b.type));
      break;
    default:
      // 'default' = insertion order (already correct)
      break;
  }
  return copy;
}

/* ============================================================
   RENDER: ACTIVITY LIST
   ============================================================ */

function renderActivityList() {
  activityListEl.innerHTML = '';
  const sorted = getSortedActivities();

  if (sorted.length === 0) {
    listEmptyEl.style.display = 'block';
    return;
  }
  listEmptyEl.style.display = 'none';

  sorted.forEach(activity => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.setAttribute('role', 'listitem');

    const dotColor = colorForType(activity.type);

    item.innerHTML = `
      <span class="activity-type-dot" style="background:${dotColor}" aria-hidden="true"></span>
      <div class="activity-info">
        <div class="activity-name" title="${escapeHtml(activity.name)}">${escapeHtml(activity.name)}</div>
        <div class="activity-meta">${escapeHtml(activity.type)}</div>
      </div>
      <span class="activity-duration">${activity.duration} min</span>
      <button class="btn-delete" data-id="${activity.id}" aria-label="Delete ${escapeHtml(activity.name)}">🗑️</button>
    `;

    activityListEl.appendChild(item);
  });
}

/** Minimal HTML escaping to prevent XSS from user input */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ============================================================
   RENDER: TOTAL FOCUS TIME
   ============================================================ */

function renderTotal() {
  const total = activities.reduce((sum, a) => sum + a.duration, 0);
  totalTimeEl.textContent = total;
}

/* ============================================================
   RENDER: PIE CHART
   ============================================================ */

function renderChart() {
  // Aggregate durations by type
  const typeMap = {};
  activities.forEach(a => {
    typeMap[a.type] = (typeMap[a.type] || 0) + a.duration;
  });

  const labels  = Object.keys(typeMap);
  const data    = labels.map(l => typeMap[l]);
  const colors  = labels.map(l => colorForType(l));

  if (labels.length === 0) {
    chartEmptyEl.style.display = 'block';
    chartCanvas.style.display  = 'none';
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  chartEmptyEl.style.display = 'none';
  chartCanvas.style.display  = 'block';

  if (chartInstance) {
    chartInstance.data.labels           = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = colors;
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--bg-card').trim() || '#ffffff',
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            font: { size: 13, family: "'Segoe UI', system-ui, sans-serif" },
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--text-primary').trim() || '#1e293b',
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed} min`,
          },
        },
      },
    },
  });
}

/* ============================================================
   MASTER UI UPDATE
   ============================================================ */

function updateUI() {
  renderTotal();
  renderActivityList();
  renderChart();
}

/* ============================================================
   INITIALISATION
   ============================================================ */

function init() {
  // Restore theme
  const savedTheme = loadTheme();
  applyTheme(savedTheme);

  // Restore data
  loadActivities();
  loadCustomCats();

  // Sync dropdown with custom categories
  syncTypeDropdown();
  renderCustomCatTags();

  // Render everything
  updateUI();
}

init();
