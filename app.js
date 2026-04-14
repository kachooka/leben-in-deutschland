/* ══════════════════════════════════════════════════════
   Leben in Deutschland — Einbürgerungstest
   app.js — Vollständige Anwendungslogik
══════════════════════════════════════════════════════ */

// ─── Global State ─────────────────────────────────────
const app = {
  questions:  [],   // Alle Fragen aus JSON
  categories: {},   // Konfiguration der Kategorien
  testTotal:  33,   // Anzahl Fragen im Prüfungsmodus

  study: {
    list:      [],  // Gefilterte Frageliste
    idx:       0,   // Aktueller Index
    answered:  false,
    selected:  -1,
    showExp:   false,
    filter:    'all'
  },

  test: {
    list:         [],  // 33 zufällige Fragen
    idx:          0,
    answers:      [],  // { selected, correct, question } je Frage
    answered:     false,
    selected:     -1
  }
};

// ─── Hilfsfunktionen ──────────────────────────────────

/** Fisher-Yates Shuffle — mischt Array ohne Wiederholungen */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Zeigt einen bestimmten Screen an, versteckt alle anderen */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

/** Option-Button HTML generieren */
function buildOption(text, index, state) {
  const letters = ['A', 'B', 'C', 'D'];
  let cls = 'opt';
  if (state === 'correct') cls += ' correct';
  if (state === 'wrong')   cls += ' wrong';
  const disabled = (state !== 'normal') ? 'disabled' : '';
  return `
    <button class="${cls}" onclick="handleOption(${index})" ${disabled}>
      <span class="opt-letter">${letters[index]}</span>
      <span class="opt-text">${text}</span>
    </button>`;
}

// ─── Daten laden ──────────────────────────────────────

async function loadData() {
  try {
    const res  = await fetch('data/questions.json');
    const data = await res.json();

    app.questions  = data.questions;
    app.categories = data.testConfig.categories;
    app.testTotal  = data.testConfig.totalTest;

    // Kategorie-Select im Lernmodus befüllen
    const sel = document.getElementById('study-select');
    sel.innerHTML = '<option value="all">📋 Alle Themen</option>';
    for (const [id, cat] of Object.entries(app.categories)) {
      sel.innerHTML += `<option value="${id}">${cat.name}</option>`;
    }

    // Startseite anzeigen
    goHome();

  } catch (err) {
    console.error(err);
    document.getElementById('app').innerHTML =
      '<div class="loading">⚠️ Fragen konnten nicht geladen werden. Bitte Seite neu laden.</div>';
  }
}

// ─── HOME ─────────────────────────────────────────────

function goHome() {
  // Meta-Info
  document.getElementById('home-meta').textContent =
    `${app.questions.length} Fragen • ${Object.keys(app.categories).length} Themen • Kostenlos`;

  // Kategorie-Chips
  const grid = document.getElementById('home-cat-grid');
  grid.innerHTML = Object.entries(app.categories).map(([id, cat]) => `
    <button class="cat-chip" onclick="startStudy('${id}')"
            style="--cat-color: ${cat.color}">
      ${cat.name}
    </button>
  `).join('');

  showScreen('screen-home');
}

// ─── LERNMODUS (Study) ────────────────────────────────

function startStudy(filter = 'all') {
  const s = app.study;
  s.filter   = filter;
  s.idx      = 0;
  s.answered = false;
  s.selected = -1;
  s.showExp  = false;
  s.list     = filter === 'all'
    ? app.questions
    : app.questions.filter(q => q.categoryId === filter);

  // Select-Element synchronisieren
  document.getElementById('study-select').value = filter;

  showScreen('screen-study');
  renderStudy();
}

function onCategoryChange() {
  const val = document.getElementById('study-select').value;
  startStudy(val);
}

function renderStudy() {
  const s = app.study;
  const q = s.list[s.idx];

  // Fortschritt
  document.getElementById('study-progress').textContent =
    `${s.idx + 1} / ${s.list.length}`;

  // Kategorie-Badge
  const cat = app.categories[q.categoryId];
  const badge = document.getElementById('study-badge');
  badge.textContent = cat.name;
  badge.style.setProperty('--cat-color', cat.color);

  // Frage
  document.getElementById('study-question').textContent = q.question;

  // Antwortoptionen
  const opts = q.options.map((opt, i) => {
    let state = 'normal';
    if (s.answered) {
      if (i === q.correct)                         state = 'correct';
      else if (i === s.selected && i !== q.correct) state = 'wrong';
    }
    return buildOption(opt, i, state);
  }).join('');
  document.getElementById('study-options').innerHTML = opts;

  // Erklärungsbox
  renderStudyExp(q);

  // Navigations-Buttons
  document.getElementById('btn-prev').disabled = (s.idx === 0);
  document.getElementById('btn-next').textContent =
    s.idx === s.list.length - 1 ? 'Fertig ✓' : 'Weiter →';
}

function renderStudyExp(q) {
  const s   = app.study;
  const box = document.getElementById('study-exp');

  if (!s.answered) {
    box.classList.add('hidden');
    return;
  }

  if (s.showExp) {
    box.classList.remove('hidden');
    box.innerHTML = `
      <div class="exp-tag">🇻🇳 Giải thích tiếng Việt</div>
      <p>${q.explanation_vi}</p>`;
  } else {
    box.classList.remove('hidden');
    box.innerHTML = `
      <button class="btn-exp-toggle" onclick="toggleExp()">
        🇻🇳 Giải thích bằng tiếng Việt
      </button>`;
  }
}

/** Wird von Option-Buttons aufgerufen (Study-Modus) */
function handleOption(i) {
  const s = app.study;
  if (s.answered) return;
  s.selected = i;
  s.answered = true;
  renderStudy();
}

function toggleExp() {
  app.study.showExp = !app.study.showExp;
  renderStudy();
}

function studyNext() {
  const s = app.study;
  if (s.idx === s.list.length - 1) { goHome(); return; }
  s.idx++;
  s.answered = false;
  s.selected = -1;
  s.showExp  = false;
  renderStudy();
}

function studyPrev() {
  const s = app.study;
  if (s.idx === 0) return;
  s.idx--;
  s.answered = false;
  s.selected = -1;
  s.showExp  = false;
  renderStudy();
}

// ─── PRÜFUNGSMODUS (Test) ─────────────────────────────

function startTest() {
  const t = app.test;
  t.list     = buildTestQuestions();
  t.idx      = 0;
  t.answers  = [];
  t.answered = false;
  t.selected = -1;

  showScreen('screen-test');
  renderTest();
}

/**
 * Stratified Sampling:
 * Aus jeder Kategorie wird eine bestimmte Anzahl Fragen
 * zufällig ausgewählt (ohne Wiederholung innerhalb der Kategorie).
 * Am Ende werden alle 33 Fragen nochmals gemischt.
 */
function buildTestQuestions() {
  const result = [];

  for (const [catId, config] of Object.entries(app.categories)) {
    const pool    = app.questions.filter(q => q.categoryId === catId);
    const mixed   = shuffle(pool);
    const count   = Math.min(config.takeForTest, mixed.length);
    result.push(...mixed.slice(0, count));
  }

  return shuffle(result);  // Finales Mischen der 33 Fragen
}

function renderTest() {
  const t = app.test;
  const q = t.list[t.idx];
  const total = t.list.length;

  // Fortschrittsbalken
  const pct = (t.idx / total) * 100;
  document.getElementById('test-pbar').style.width = `${pct}%`;
  document.getElementById('test-progress').textContent = `${t.idx + 1} / ${total}`;

  // Frage
  document.getElementById('test-question').textContent = q.question;

  // Antwortoptionen
  const opts = q.options.map((opt, i) => {
    let state = 'normal';
    if (t.answered) {
      if (i === q.correct)                         state = 'correct';
      else if (i === t.selected && i !== q.correct) state = 'wrong';
    }
    return buildOption(opt, i, state);
  }).join('');
  document.getElementById('test-options').innerHTML = opts;

  // Weiter-Button
  const btn = document.getElementById('btn-test-next');
  btn.disabled    = !t.answered;
  btn.textContent = t.idx === total - 1
    ? 'Ergebnis anzeigen →'
    : 'Nächste Frage →';
}

/** Option-Klick im Prüfungsmodus */
function handleOption(i) {
  // Diese Funktion überschreibt die Study-Version je nach aktivem Screen
  const studyActive = document.getElementById('screen-study').classList.contains('active');
  const testActive  = document.getElementById('screen-test').classList.contains('active');

  if (studyActive) {
    const s = app.study;
    if (s.answered) return;
    s.selected = i;
    s.answered = true;
    renderStudy();
  }

  if (testActive) {
    const t = app.test;
    if (t.answered) return;
    t.selected = i;
    t.answered = true;

    const q = t.list[t.idx];
    t.answers.push({
      question:  q,
      selected:  i,
      isCorrect: i === q.correct
    });

    renderTest();
  }
}

function testNext() {
  const t = app.test;

  if (t.idx === t.list.length - 1) {
    renderResults();
    return;
  }

  t.idx++;
  t.answered = false;
  t.selected = -1;
  renderTest();
}

function confirmExit() {
  if (confirm('Prüfung wirklich abbrechen? Ihr Fortschritt geht verloren.')) {
    goHome();
  }
}

// ─── ERGEBNISSE (Results) ─────────────────────────────

function renderResults() {
  const t     = app.test;
  const score = t.answers.filter(a => a.isCorrect).length;
  const total = t.list.length;
  const pass  = score >= 17;   // Bestehensschwelle: 17/33

  // Score
  document.getElementById('res-score').textContent = `${score}/${total}`;

  // Verdict
  const vEl = document.getElementById('res-verdict');
  vEl.textContent = pass ? '✓ Bestanden' : '✗ Nicht bestanden';
  vEl.className   = `verdict ${pass ? 'passed' : 'failed'}`;

  // Sub-text
  document.getElementById('res-sub').textContent = pass
    ? `Herzlichen Glückwunsch! Mindestpunktzahl: 17/${total}`
    : `Weiter üben! Mindestpunktzahl zum Bestehen: 17/${total}`;

  // Fortschrittsbalken am Ende = 100%
  document.getElementById('test-pbar').style.width = '100%';

  // Frageliste
  const listEl = document.getElementById('results-list');
  listEl.innerHTML = t.answers.map((a, i) => {
    const q   = a.question;
    const cls = a.isCorrect ? 'correct' : 'wrong';
    const ico = a.isCorrect ? '✓' : '✗';
    return `
      <div class="res-item ${cls}">
        <span class="res-num">${i + 1}</span>
        <span class="res-icon">${ico}</span>
        <div class="res-content">
          <p class="res-q">${q.question}</p>
          ${!a.isCorrect ? `
            <p class="res-ans-wrong">Ihre Antwort: ${q.options[a.selected]}</p>
            <p class="res-ans">Richtig: ${q.options[q.correct]}</p>
          ` : ''}
        </div>
      </div>`;
  }).join('');

  showScreen('screen-results');
}

// ─── Start ────────────────────────────────────────────
loadData();
