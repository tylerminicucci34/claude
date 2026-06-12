/* ═══════════════════════════════════════
   GymTrack Pro — Main Application
═══════════════════════════════════════ */

// ── State ────────────────────────────────────────────────────────────────────
let STATE = {
  user: null,          // { name, goal, level, equipment }
  workouts: [],        // completed workout logs
  photos: [],          // progress photos
  measurements: [],    // body measurements over time
  goals: {},           // target weight, body fat, etc.
  currentDay: 0        // index into plan.days for today
};

let ACTIVE = {
  running: false,
  timerInterval: null,
  elapsed: 0,
  planDay: null,
  exerciseIndex: 0,
  setData: [],         // [{weight, reps, done}] per exercise per set
  rpe: 7,
  restInterval: null,
  restTotal: 0,
  restRemaining: 0
};

let cameraStream = null;
let cameraFacing = 'user';
let compareSlot = null; // which slot (0|1) is being filled in compare modal
let chartMetric = 'weight';

// ── Persistence ───────────────────────────────────────────────────────────────
function save() {
  localStorage.setItem('gymtrack_state', JSON.stringify(STATE));
}
function load() {
  const raw = localStorage.getItem('gymtrack_state');
  if (raw) {
    try { STATE = { ...STATE, ...JSON.parse(raw) }; } catch {}
  }
}

// ── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  load();
  if (STATE.user) {
    showMainApp();
  } else {
    showOnboarding();
  }
  wireOnboarding();
  wireNav();
  wirePhotoTab();
  wireGoalsTab();
  wireWorkoutOverlay();
  document.getElementById('start-workout-btn').addEventListener('click', startWorkout);
});

// ── Onboarding ────────────────────────────────────────────────────────────────
let obStep = 1;
let obData = { name: '', goal: '', level: '', equipment: '' };

function showOnboarding() {
  document.getElementById('onboarding').classList.add('active');
  document.getElementById('main-app').classList.remove('active');
  showObStep(1);
}

function showObStep(n) {
  obStep = n;
  document.querySelectorAll('.onboard-slide').forEach(s => s.classList.remove('active'));
  document.getElementById(`ob-step-${n}`)?.classList.add('active');
}

function wireOnboarding() {
  // Step 1 → 2
  document.getElementById('ob-start')?.addEventListener('click', () => showObStep(2));

  // Step 2: name input
  const nameInput = document.getElementById('ob-name');
  const nameNext = document.getElementById('ob-name-next');
  nameInput?.addEventListener('input', () => {
    nameNext.disabled = nameInput.value.trim().length < 2;
  });
  nameNext?.addEventListener('click', () => {
    obData.name = nameInput.value.trim();
    showObStep(3);
  });

  // Step 3: goal cards
  document.querySelectorAll('.goal-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      obData.goal = card.dataset.goal;
      document.getElementById('ob-goal-next').disabled = false;
    });
  });
  document.getElementById('ob-goal-next')?.addEventListener('click', () => showObStep(4));

  // Step 4: fitness level
  document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      obData.level = card.dataset.level;
      document.getElementById('ob-level-next').disabled = false;
    });
  });
  document.getElementById('ob-level-next')?.addEventListener('click', () => showObStep(5));

  // Step 5: equipment
  document.querySelectorAll('.equip-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.equip-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      obData.equipment = card.dataset.equipment;
      document.getElementById('ob-equip-next').disabled = false;
    });
  });
  document.getElementById('ob-equip-next')?.addEventListener('click', () => {
    buildReadyScreen();
    showObStep(6);
  });

  // Step 6: finish
  document.getElementById('ob-finish')?.addEventListener('click', finishOnboarding);
}

function buildReadyScreen() {
  const plan = WORKOUT_PLANS[obData.goal];
  const goalInfo = GOAL_INFO[obData.goal];
  const equipLabels = { full: 'Full Gym', home: 'Home Gym', dumbbells: 'Dumbbells Only', bodyweight: 'Bodyweight Only' };
  const levelLabels = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

  document.getElementById('ready-plan-name').textContent = plan.name;
  document.getElementById('ready-plan-desc').textContent = plan.description;
  document.getElementById('ready-plan-schedule').textContent = plan.schedule;
  document.getElementById('ready-plan-goal').textContent = goalInfo.label;
  document.getElementById('ready-plan-equip').textContent = equipLabels[obData.equipment] || obData.equipment;
  document.getElementById('ready-plan-level').textContent = levelLabels[obData.level] || obData.level;
}

function finishOnboarding() {
  STATE.user = { ...obData };
  STATE.goals = { targetWeight: '', targetBodyFat: '', weeklyWorkouts: 4 };
  STATE.currentDay = 0;
  save();
  showMainApp();
}

// ── Main App ──────────────────────────────────────────────────────────────────
function showMainApp() {
  document.getElementById('onboarding').classList.remove('active');
  document.getElementById('main-app').classList.add('active');
  updateHeader();
  renderDashboard();
  renderWorkoutPlan();
  renderGoalsTab();
  renderPhotos();
  switchTab('dashboard');
}

function updateHeader() {
  const streak = computeStreak();
  document.getElementById('streak-count').textContent = `${streak} day${streak !== 1 ? 's' : ''}`;
}

function computeStreak() {
  if (!STATE.workouts.length) return 0;
  const sorted = [...STATE.workouts].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let d = new Date(); d.setHours(0,0,0,0);
  for (const w of sorted) {
    const wd = new Date(w.date); wd.setHours(0,0,0,0);
    const diff = Math.round((d - wd) / 86400000);
    if (diff > 1) break;
    if (diff <= 1) { streak++; d = wd; }
  }
  return streak;
}

// ── Tab Navigation ────────────────────────────────────────────────────────────
function wireNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`)?.classList.add('active');
  document.querySelector(`.nav-btn[data-tab="${name}"]`)?.classList.add('active');
  document.querySelector('.app-header h1').textContent = {
    dashboard: 'GymTrack',
    workout: 'My Plan',
    photos: 'Progress Photos',
    goals: 'Goals'
  }[name] || 'GymTrack';
  if (name === 'goals') setTimeout(drawProgressChart, 50);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  const plan = WORKOUT_PLANS[STATE.user?.goal];
  const thisWeek = getThisWeekWorkouts();

  // Greeting
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('dash-greeting').textContent = `${greet}, ${STATE.user?.name || 'Athlete'}!`;

  // Stats
  document.getElementById('stat-week-workouts').textContent = thisWeek.length;
  document.getElementById('stat-total-workouts').textContent = STATE.workouts.length;
  document.getElementById('stat-streak').textContent = computeStreak();

  const avgRpe = thisWeek.length
    ? Math.round(thisWeek.reduce((s, w) => s + (w.rpe || 7), 0) / thisWeek.length)
    : '—';
  document.getElementById('stat-avg-rpe').textContent = avgRpe;

  // Today's card
  if (plan) {
    const day = plan.days[STATE.currentDay % plan.days.length];
    document.getElementById('today-day-name').textContent = day.name;
    document.getElementById('today-focus').textContent = day.focus;
    const preview = document.getElementById('today-exercise-preview');
    preview.innerHTML = day.exercises.slice(0, 3).map(e =>
      `<div class="ep-item"><div class="ep-dot"></div><span>${e.name}</span></div>`
    ).join('') +
      (day.exercises.length > 3
        ? `<div class="ep-more">+${day.exercises.length - 3} more exercises</div>`
        : '');
  }

  // Week calendar
  renderWeekCalendar();

  // Recent workouts
  renderRecentWorkouts();
}

function getThisWeekWorkouts() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0,0,0,0);
  return STATE.workouts.filter(w => new Date(w.date) >= weekStart);
}

function renderWeekCalendar() {
  const days = ['S','M','T','W','T','F','S'];
  const today = new Date().getDay();
  const thisWeek = getThisWeekWorkouts();
  const doneDays = new Set(thisWeek.map(w => new Date(w.date).getDay()));

  const container = document.getElementById('week-days');
  container.innerHTML = days.map((d, i) => {
    const isDone = doneDays.has(i);
    const isToday = i === today;
    const cls = isDone ? 'done' : isToday ? 'today' : '';
    const icon = isDone ? '✓' : isToday ? '●' : '';
    return `<div class="wd">
      <div class="wd-label">${d}</div>
      <div class="wd-dot ${cls}">${icon}</div>
    </div>`;
  }).join('');
}

function renderRecentWorkouts() {
  const container = document.getElementById('recent-workouts-list');
  const recent = [...STATE.workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  if (!recent.length) {
    container.innerHTML = `<p style="color:var(--text3);font-size:14px;text-align:center;padding:20px 0">No workouts yet — start your first!</p>`;
    return;
  }

  container.innerHTML = recent.map(w => {
    const mins = Math.floor((w.elapsed || 0) / 60);
    const rpe = w.rpe || 7;
    const rpeColor = rpe <= 4 ? '#00ff88' : rpe <= 6 ? '#ffcc00' : rpe <= 8 ? '#ff6b00' : '#ff3366';
    const date = new Date(w.date).toLocaleDateString('en-US', { month:'short', day:'numeric' });
    return `<div class="workout-history-item">
      <div class="whi-left">
        <h4>${w.dayName || 'Workout'}</h4>
        <p>${date} · ${w.exercises || 0} exercises</p>
      </div>
      <div class="whi-right">
        <div class="dur">${mins}m</div>
        <div class="rpe-chip" style="background:${rpeColor}22;color:${rpeColor}">RPE ${rpe}</div>
      </div>
    </div>`;
  }).join('');
}

// ── Workout Plan Tab ──────────────────────────────────────────────────────────
let activePlanDay = 0;

function renderWorkoutPlan() {
  if (!STATE.user) return;
  const plan = WORKOUT_PLANS[STATE.user.goal];
  const goalInfo = GOAL_INFO[STATE.user.goal];
  const equipMap = { full: 'Full Gym', home: 'Home Gym', dumbbells: 'Dumbbells Only', bodyweight: 'Bodyweight Only' };

  document.getElementById('plan-icon').textContent = goalInfo.icon;
  document.getElementById('plan-name').textContent = plan.name;
  document.getElementById('plan-desc').textContent = `${plan.description} · ${equipMap[STATE.user.equipment] || ''}`;
  document.getElementById('plan-schedule').textContent = plan.schedule;

  // Initialise to today's plan day
  activePlanDay = STATE.currentDay % plan.days.length;

  // Day tabs
  const tabsContainer = document.getElementById('plan-day-tabs');
  tabsContainer.innerHTML = plan.days.map((day, i) => {
    const isToday = i === activePlanDay;
    return `<button class="day-tab ${i === activePlanDay ? 'active' : ''}" data-idx="${i}">
      ${day.emoji} ${day.name}${isToday ? ' · Today' : ''}
    </button>`;
  }).join('');

  tabsContainer.querySelectorAll('.day-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activePlanDay = parseInt(btn.dataset.idx);
      renderPlanDayExercises();
      tabsContainer.querySelectorAll('.day-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  renderPlanDayExercises();
}

function getEquipmentNote(equipment) {
  const mods = {
    home: { 'Cable Chest Fly': 'DB Fly (home sub)', 'Leg Press': 'Goblet Squat (home sub)', 'Lat Pulldown': 'Pull-Ups (home sub)', 'Machine': 'DB alternative' },
    dumbbells: { 'Barbell': 'Dumbbell version', 'Cable': 'Dumbbell version', 'Machine': 'Dumbbell version' },
    bodyweight: { 'Barbell': 'Bodyweight / Resistance Band', 'Cable': 'Resistance Band', 'Machine': 'Bodyweight alternative', 'Dumbbell': 'Bodyweight alternative' }
  };
  return mods[equipment] || {};
}

function getEquipmentSubstitute(exName, equipment) {
  const subs = {
    bodyweight: {
      'Barbell Bench Press': 'Push-Ups / Dips',
      'Incline Barbell Press': 'Decline Push-Ups',
      'Barbell Row': 'Inverted Row / Pull-Up',
      'Deadlift': 'Single-Leg Hip Hinge (BW)',
      'Back Squat': 'Bodyweight Squat / Jump Squat',
      'Leg Press': 'Wall Sit / Pistol Squat',
      'Overhead Press': 'Pike Push-Up',
      'Lat Pulldown': 'Pull-Ups',
      'Cable': 'Resistance Band',
      'Barbell Curl': 'Chin-Ups / Band Curl',
    },
    dumbbells: {
      'Barbell Bench Press': 'DB Bench Press',
      'Barbell Row': 'DB Row',
      'Back Squat': 'Goblet Squat',
      'Deadlift': 'DB Romanian Deadlift',
      'Overhead Press': 'DB Overhead Press',
      'Barbell Curl': 'DB Curl',
      'Cable': 'DB equivalent',
    },
    home: {
      'Cable Chest Fly': 'DB Fly',
      'Leg Press': 'Goblet Squat',
      'Lat Pulldown': 'Pull-Ups',
      'Face Pulls': 'Band Face Pulls',
      'Machine': 'DB/BW alternative',
    }
  };
  if (equipment === 'full') return null;
  const map = subs[equipment] || {};
  for (const [key, sub] of Object.entries(map)) {
    if (exName.includes(key)) return sub;
  }
  return null;
}

function renderPlanDayExercises() {
  const plan = WORKOUT_PLANS[STATE.user.goal];
  const day = plan.days[activePlanDay];
  const equipment = STATE.user.equipment;

  document.getElementById('plan-day-focus').textContent = `${day.emoji} ${day.focus}`;

  const container = document.getElementById('exercise-list-container');
  container.innerHTML = day.exercises.map((ex, i) => {
    const sub = getEquipmentSubstitute(ex.name, equipment);
    return `<div class="ex-card">
      <div class="ex-card-top">
        <div>
          <div class="ex-name">${sub ? `<span style="text-decoration:line-through;color:var(--text3);font-size:13px">${ex.name}</span><br>${sub}` : ex.name}</div>
        </div>
        <div style="font-size:18px;opacity:0.4">${['🏋️','💪','🔥','⚡','🎯','🏃','🔄'][i % 7]}</div>
      </div>
      <div class="ex-meta">
        <span class="ex-badge orange">${ex.sets} sets</span>
        <span class="ex-badge">${ex.reps} reps</span>
        <span class="ex-badge">${ex.rest}s rest</span>
        ${sub ? `<span class="ex-badge" style="background:rgba(0,212,255,0.1);border-color:rgba(0,212,255,0.3);color:var(--blue)">⚙️ Modified</span>` : ''}
      </div>
      ${ex.note ? `<div class="ex-note">💡 ${ex.note}</div>` : ''}
    </div>`;
  }).join('');
}

// ── Active Workout ─────────────────────────────────────────────────────────────
function startWorkout() {
  const plan = WORKOUT_PLANS[STATE.user.goal];
  const dayIdx = activePlanDay;
  ACTIVE.planDay = plan.days[dayIdx];
  ACTIVE.exerciseIndex = 0;
  ACTIVE.elapsed = 0;
  ACTIVE.rpe = 7;
  ACTIVE.running = true;
  ACTIVE.setData = ACTIVE.planDay.exercises.map(ex => ({
    sets: Array.from({ length: ex.sets }, () => ({ weight: '', reps: ex.reps.split('-')[0], done: false }))
  }));

  document.getElementById('workout-overlay').classList.remove('hidden');
  document.getElementById('wo-workout-name').textContent = ACTIVE.planDay.name;

  renderActiveExercise();
  startTimer();
  updateIntensityMeter();
  document.getElementById('wo-summary').classList.remove('active');
  document.getElementById('wo-main').classList.remove('hidden');
}

function wireWorkoutOverlay() {
  document.getElementById('wo-close').addEventListener('click', () => {
    if (confirm('End this workout?')) endWorkout(false);
  });

  const rpeSlider = document.getElementById('rpe-slider');
  rpeSlider.addEventListener('input', () => {
    ACTIVE.rpe = parseInt(rpeSlider.value);
    updateIntensityMeter();
  });

  document.getElementById('wo-prev-ex').addEventListener('click', () => {
    if (ACTIVE.exerciseIndex > 0) {
      ACTIVE.exerciseIndex--;
      renderActiveExercise();
    }
  });

  document.getElementById('wo-next-ex').addEventListener('click', () => {
    const total = ACTIVE.planDay?.exercises.length || 0;
    if (ACTIVE.exerciseIndex < total - 1) {
      ACTIVE.exerciseIndex++;
      renderActiveExercise();
    } else {
      endWorkout(true);
    }
  });

  document.getElementById('wo-finish-btn').addEventListener('click', () => endWorkout(true));

  document.getElementById('rt-skip').addEventListener('click', stopRestTimer);
}

function renderActiveExercise() {
  const exercises = ACTIVE.planDay.exercises;
  const ex = exercises[ACTIVE.exerciseIndex];
  const equipment = STATE.user?.equipment;
  const sub = getEquipmentSubstitute(ex.name, equipment);
  const displayName = sub || ex.name;

  document.getElementById('wo-ex-number').textContent = `Exercise ${ACTIVE.exerciseIndex + 1} of ${exercises.length}`;
  document.getElementById('wo-ex-name').textContent = displayName;
  document.getElementById('wo-ex-note').textContent = ex.note || '';

  // Progress bar
  const pct = Math.round((ACTIVE.exerciseIndex / exercises.length) * 100);
  document.getElementById('wo-prog-fill').style.width = pct + '%';
  document.getElementById('wo-prog-label-text').textContent = `${ACTIVE.exerciseIndex + 1} / ${exercises.length} exercises`;

  // Prev/Next button states
  document.getElementById('wo-prev-ex').disabled = ACTIVE.exerciseIndex === 0;
  const isLast = ACTIVE.exerciseIndex === exercises.length - 1;
  document.getElementById('wo-next-ex').textContent = isLast ? '✓ Done' : 'Next →';

  renderSetsTracker(ex);
}

function renderSetsTracker(ex) {
  const setData = ACTIVE.setData[ACTIVE.exerciseIndex].sets;
  const container = document.getElementById('sets-tracker');
  container.innerHTML = setData.map((s, i) => `
    <div class="set-row ${s.done ? 'completed' : ''}" id="set-row-${i}">
      <span class="set-num">Set ${i + 1}</span>
      <div class="set-inputs">
        <div class="set-input-group">
          <label>Weight (lbs)</label>
          <input type="number" inputmode="decimal" placeholder="—" value="${s.weight}"
            onchange="updateSetData(${i}, 'weight', this.value)">
        </div>
        <div class="set-input-group">
          <label>Reps</label>
          <input type="number" inputmode="numeric" placeholder="${ex.reps.split('-')[0]}" value="${s.reps}"
            onchange="updateSetData(${i}, 'reps', this.value)">
        </div>
      </div>
      <button class="set-check ${s.done ? 'done' : ''}" onclick="toggleSet(${i})">
        ${s.done ? '✓' : ''}
      </button>
    </div>
  `).join('');
}

function updateSetData(setIdx, field, value) {
  ACTIVE.setData[ACTIVE.exerciseIndex].sets[setIdx][field] = value;
}

function toggleSet(setIdx) {
  const set = ACTIVE.setData[ACTIVE.exerciseIndex].sets[setIdx];
  set.done = !set.done;
  const row = document.getElementById(`set-row-${setIdx}`);

  if (set.done) {
    row.classList.add('completed');
    row.querySelector('.set-check').classList.add('done');
    row.querySelector('.set-check').textContent = '✓';

    // Start rest timer if not last set
    const ex = ACTIVE.planDay.exercises[ACTIVE.exerciseIndex];
    const isLastSet = setIdx === ACTIVE.setData[ACTIVE.exerciseIndex].sets.length - 1;
    if (!isLastSet) {
      startRestTimer(ex.rest);
    }
  } else {
    row.classList.remove('completed');
    row.querySelector('.set-check').classList.remove('done');
    row.querySelector('.set-check').textContent = '';
  }
}

// ── Timer ─────────────────────────────────────────────────────────────────────
function startTimer() {
  clearInterval(ACTIVE.timerInterval);
  ACTIVE.elapsed = 0;
  ACTIVE.timerInterval = setInterval(() => {
    ACTIVE.elapsed++;
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const h = Math.floor(ACTIVE.elapsed / 3600);
  const m = Math.floor((ACTIVE.elapsed % 3600) / 60);
  const s = ACTIVE.elapsed % 60;
  const fmt = (n) => String(n).padStart(2, '0');
  document.getElementById('wo-clock').textContent = h > 0
    ? `${fmt(h)}:${fmt(m)}:${fmt(s)}`
    : `${fmt(m)}:${fmt(s)}`;
}

// ── Rest Timer ────────────────────────────────────────────────────────────────
function startRestTimer(seconds) {
  ACTIVE.restTotal = seconds;
  ACTIVE.restRemaining = seconds;

  const overlay = document.getElementById('rest-timer-overlay');
  overlay.classList.remove('hidden');

  const ex = ACTIVE.planDay.exercises[ACTIVE.exerciseIndex];
  const nextSetIdx = ACTIVE.setData[ACTIVE.exerciseIndex].sets.findIndex(s => !s.done);
  const nextExIdx = ACTIVE.exerciseIndex + 1 < ACTIVE.planDay.exercises.length ? ACTIVE.exerciseIndex + 1 : null;
  document.getElementById('rt-next-info').textContent = nextExIdx !== null && nextSetIdx === -1
    ? `Next: ${ACTIVE.planDay.exercises[nextExIdx].name}`
    : `Next: Set ${nextSetIdx + 1} of ${ex.name}`;

  updateRestDisplay();
  clearInterval(ACTIVE.restInterval);
  ACTIVE.restInterval = setInterval(() => {
    ACTIVE.restRemaining--;
    updateRestDisplay();
    if (ACTIVE.restRemaining <= 0) stopRestTimer();
  }, 1000);
}

function updateRestDisplay() {
  const m = Math.floor(ACTIVE.restRemaining / 60);
  const s = ACTIVE.restRemaining % 60;
  document.getElementById('rt-clock').textContent = `${m}:${String(s).padStart(2,'0')}`;
  const pct = (ACTIVE.restRemaining / ACTIVE.restTotal) * 100;
  document.getElementById('rt-bar').style.width = pct + '%';
}

function stopRestTimer() {
  clearInterval(ACTIVE.restInterval);
  document.getElementById('rest-timer-overlay').classList.add('hidden');
}

// ── Intensity Meter ───────────────────────────────────────────────────────────
function updateIntensityMeter() {
  const rpe = ACTIVE.rpe;
  document.getElementById('rpe-slider').value = rpe;

  const colors = ['','#4ade80','#4ade80','#86efac','#fbbf24','#fb923c','#f97316','#ef4444','#dc2626','#b91c1c','#7f1d1d'];
  const color = colors[rpe] || '#ff6b00';

  document.getElementById('rpe-value').textContent = `RPE ${rpe}/10`;
  document.getElementById('rpe-value').style.color = color;
  document.getElementById('rpe-desc').textContent = INTENSITY_TIPS[rpe] || '';

  drawIntensityGauge(rpe, color);
}

function drawIntensityGauge(rpe, activeColor) {
  const canvas = document.getElementById('intensity-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H * 0.72;
  const R = W * 0.38;

  ctx.clearRect(0, 0, W, H);

  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const totalArc = endAngle - startAngle;

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, R, startAngle, endAngle);
  ctx.strokeStyle = '#2e2e2e';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Coloured segments
  for (let i = 1; i <= 10; i++) {
    const seg = i / 10;
    const segStart = startAngle + (i - 1) / 10 * totalArc;
    const segEnd = startAngle + seg * totalArc;
    const segColors = ['#4ade80','#4ade80','#86efac','#fbbf24','#fb923c','#f97316','#ef4444','#ef4444','#dc2626','#b91c1c'];
    ctx.beginPath();
    ctx.arc(cx, cy, R, segStart + 0.02, segEnd - 0.02);
    ctx.strokeStyle = i <= rpe ? segColors[i - 1] : '#2e2e2e';
    ctx.lineWidth = 16;
    ctx.lineCap = 'butt';
    ctx.stroke();
  }

  // Pointer
  const angle = startAngle + (rpe / 10) * totalArc;
  const px = cx + (R) * Math.cos(angle);
  const py = cy + (R) * Math.sin(angle);
  ctx.beginPath();
  ctx.arc(px, py, 10, 0, Math.PI * 2);
  ctx.fillStyle = activeColor;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Label at top
  ctx.fillStyle = '#888';
  ctx.font = '11px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText('1', cx - R - 16, cy + 4);
  ctx.textAlign = 'right';
  ctx.fillText('10', cx + R + 16, cy + 4);
}

// ── End Workout ────────────────────────────────────────────────────────────────
function endWorkout(completed) {
  clearInterval(ACTIVE.timerInterval);
  stopRestTimer();

  if (completed) {
    const record = {
      id: Date.now(),
      date: new Date().toISOString(),
      dayName: ACTIVE.planDay?.name,
      elapsed: ACTIVE.elapsed,
      rpe: ACTIVE.rpe,
      exercises: ACTIVE.planDay?.exercises.length || 0,
      sets: ACTIVE.setData.reduce((t, ex) => t + ex.sets.filter(s => s.done).length, 0),
      completed: true
    };
    STATE.workouts.push(record);
    STATE.currentDay = (STATE.currentDay + 1);
    save();

    // Show summary
    document.getElementById('wo-main').classList.add('hidden');
    document.getElementById('wo-summary').classList.add('active');
    document.getElementById('ws-time').textContent = formatDuration(ACTIVE.elapsed);
    document.getElementById('ws-sets').textContent = record.sets;
    document.getElementById('ws-rpe').textContent = ACTIVE.rpe;

    setTimeout(() => {
      document.getElementById('workout-overlay').classList.add('hidden');
      updateHeader();
      renderDashboard();
      renderWorkoutPlan();
    }, 3000);
  } else {
    document.getElementById('workout-overlay').classList.add('hidden');
  }

  ACTIVE.running = false;
}

function formatDuration(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

// ── Photos Tab ────────────────────────────────────────────────────────────────
function wirePhotoTab() {
  document.getElementById('btn-take-photo').addEventListener('click', openCamera);
  document.getElementById('btn-upload-photo').addEventListener('click', () => {
    document.getElementById('photo-file-input').click();
  });
  document.getElementById('photo-file-input').addEventListener('change', handleFileUpload);
  document.getElementById('btn-compare').addEventListener('click', openCompare);

  document.getElementById('shutter-btn').addEventListener('click', capturePhoto);
  document.getElementById('flip-btn').addEventListener('click', flipCamera);
  document.getElementById('close-camera-btn').addEventListener('click', closeCamera);

  document.getElementById('close-compare').addEventListener('click', closeCompare);
  document.getElementById('compare-slot-0').addEventListener('click', () => openPhotoPicker(0));
  document.getElementById('compare-slot-1').addEventListener('click', () => openPhotoPicker(1));

  document.getElementById('close-picker').addEventListener('click', closePhotoPicker);
}

function renderPhotos() {
  const grid = document.getElementById('photo-grid');
  const noPhotos = document.getElementById('no-photos');
  const compareBtn = document.getElementById('btn-compare');

  if (!STATE.photos.length) {
    grid.innerHTML = '';
    noPhotos.classList.remove('hidden');
    compareBtn.disabled = true;
    return;
  }

  noPhotos.classList.add('hidden');
  compareBtn.disabled = STATE.photos.length < 2;

  const sorted = [...STATE.photos].sort((a, b) => b.date.localeCompare(a.date));
  grid.innerHTML = sorted.map(p => {
    const date = new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `<div class="photo-card">
      <img src="${p.dataUrl}" alt="Progress photo">
      <div class="photo-card-info">${date}${p.note ? '<br><span style="opacity:0.7">' + p.note + '</span>' : ''}</div>
      <button class="delete-photo" onclick="deletePhoto('${p.id}')">×</button>
    </div>`;
  }).join('');
}

async function openCamera() {
  document.getElementById('camera-modal').classList.remove('hidden');
  await startCameraStream();
}

async function startCameraStream() {
  try {
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: cameraFacing, width: { ideal: 720 }, height: { ideal: 1280 } }
    });
    const video = document.getElementById('camera-video');
    video.srcObject = cameraStream;
    await video.play();
  } catch (err) {
    showToast('Camera not available. Try uploading a photo.');
    closeCamera();
  }
}

function capturePhoto() {
  const video = document.getElementById('camera-video');
  const canvas = document.getElementById('photo-canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  savePhoto(dataUrl);
  closeCamera();
}

function flipCamera() {
  cameraFacing = cameraFacing === 'user' ? 'environment' : 'user';
  startCameraStream();
}

function closeCamera() {
  if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
  document.getElementById('camera-modal').classList.add('hidden');
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { savePhoto(ev.target.result); };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function savePhoto(dataUrl) {
  const note = prompt('Add a note for this photo (optional):') || '';
  STATE.photos.push({ id: Date.now().toString(), date: new Date().toISOString(), dataUrl, note });
  save();
  renderPhotos();
  showToast('Photo saved!');
}

function deletePhoto(id) {
  if (!confirm('Delete this photo?')) return;
  STATE.photos = STATE.photos.filter(p => p.id !== id);
  save();
  renderPhotos();
}

// Compare
function openCompare() {
  document.getElementById('compare-modal').classList.remove('hidden');
  renderCompareSlots();
}

function closeCompare() {
  document.getElementById('compare-modal').classList.add('hidden');
}

function renderCompareSlots() {
  ['0', '1'].forEach(idx => {
    const slot = document.getElementById(`compare-slot-${idx}`);
    slot.dataset.photoId = '';
    slot.innerHTML = `<div class="slot-placeholder"><div style="font-size:40px">📷</div><p>${idx === '0' ? 'Before' : 'After'}</p></div>`;
  });
}

function openPhotoPicker(slotIdx) {
  compareSlot = slotIdx;
  const picker = document.getElementById('photo-picker');
  picker.classList.remove('hidden');

  const sorted = [...STATE.photos].sort((a, b) => a.date.localeCompare(b.date));
  document.getElementById('pp-grid').innerHTML = sorted.map(p => {
    const date = new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `<div class="pp-photo" onclick="selectComparePhoto('${p.id}', '${date}')">
      <img src="${p.dataUrl}" alt="${date}">
    </div>`;
  }).join('');
}

function selectComparePhoto(id, label) {
  const photo = STATE.photos.find(p => p.id === id);
  if (!photo) return;
  const slot = document.getElementById(`compare-slot-${compareSlot}`);
  slot.dataset.photoId = id;
  slot.innerHTML = `<img src="${photo.dataUrl}"><div class="slot-label">${label}</div>`;
  closePhotoPicker();
}

function closePhotoPicker() {
  document.getElementById('photo-picker').classList.add('hidden');
}

// ── Goals Tab ─────────────────────────────────────────────────────────────────
function wireGoalsTab() {
  document.getElementById('save-goals-btn').addEventListener('click', saveGoals);
  document.getElementById('add-measurement-btn').addEventListener('click', addMeasurement);

  document.querySelectorAll('.chart-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chartMetric = btn.dataset.metric;
      drawProgressChart();
    });
  });

  document.getElementById('reset-app-btn').addEventListener('click', () => {
    if (confirm('Reset all data and start over?')) {
      localStorage.removeItem('gymtrack_state');
      location.reload();
    }
  });
}

function renderGoalsTab() {
  if (!STATE.user) return;
  const goalInfo = GOAL_INFO[STATE.user.goal];
  document.getElementById('goal-icon').textContent = goalInfo.icon;
  document.getElementById('goal-label').textContent = goalInfo.label;
  document.getElementById('goal-target-desc').textContent = goalInfo.target;

  document.getElementById('target-weight').value = STATE.goals.targetWeight || '';
  document.getElementById('target-bf').value = STATE.goals.targetBodyFat || '';

  renderMeasurementHistory();
  drawProgressChart();
}

function saveGoals() {
  STATE.goals.targetWeight = document.getElementById('target-weight').value;
  STATE.goals.targetBodyFat = document.getElementById('target-bf').value;
  save();
  showToast('Goals saved!');
}

function addMeasurement() {
  const weight = document.getElementById('m-weight').value;
  const chest  = document.getElementById('m-chest').value;
  const waist  = document.getElementById('m-waist').value;
  const arms   = document.getElementById('m-arms').value;
  const legs   = document.getElementById('m-legs').value;
  const bf     = document.getElementById('m-bf').value;

  if (!weight && !chest && !waist) {
    showToast('Enter at least weight or a measurement');
    return;
  }

  STATE.measurements.push({
    date: new Date().toISOString(),
    weight: weight ? parseFloat(weight) : null,
    chest:  chest  ? parseFloat(chest)  : null,
    waist:  waist  ? parseFloat(waist)  : null,
    arms:   arms   ? parseFloat(arms)   : null,
    legs:   legs   ? parseFloat(legs)   : null,
    bf:     bf     ? parseFloat(bf)     : null
  });
  save();

  // Clear inputs
  ['m-weight','m-chest','m-waist','m-arms','m-legs','m-bf'].forEach(id => {
    document.getElementById(id).value = '';
  });

  renderMeasurementHistory();
  drawProgressChart();
  showToast('Measurement logged!');
}

function renderMeasurementHistory() {
  const container = document.getElementById('measurement-history');
  if (!STATE.measurements.length) {
    container.innerHTML = '<p style="color:var(--text3);font-size:14px;text-align:center;padding:20px 0">No measurements yet</p>';
    return;
  }
  const sorted = [...STATE.measurements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  container.innerHTML = sorted.map(m => {
    const date = new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const vals = [
      m.weight != null ? `<div class="mh-val">${m.weight}<span>lb</span></div>` : '',
      m.chest  != null ? `<div class="mh-val">${m.chest}<span>in</span></div>` : '',
      m.waist  != null ? `<div class="mh-val">${m.waist}<span>w</span></div>` : '',
      m.bf     != null ? `<div class="mh-val">${m.bf}<span>%</span></div>` : ''
    ].filter(Boolean).slice(0, 3).join('');
    return `<div class="mh-item">
      <div class="mh-date">${date}</div>
      <div class="mh-values">${vals}</div>
    </div>`;
  }).join('');
}

function drawProgressChart() {
  const canvas = document.getElementById('progress-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 320;
  canvas.width = W * (window.devicePixelRatio || 1);
  canvas.height = 160 * (window.devicePixelRatio || 1);
  canvas.style.height = '160px';
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

  const data = STATE.measurements
    .filter(m => m[chartMetric] != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(m => ({ date: new Date(m.date), val: m[chartMetric] }));

  ctx.clearRect(0, 0, W, 160);

  if (data.length < 2) {
    ctx.fillStyle = '#505050';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Log 2+ measurements to see your chart', W / 2, 80);
    return;
  }

  const pad = { t: 16, r: 16, b: 32, l: 40 };
  const cW = W - pad.l - pad.r;
  const cH = 160 - pad.t - pad.b;

  const vals = data.map(d => d.val);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const xOf = (i) => pad.l + (i / (data.length - 1)) * cW;
  const yOf = (v) => pad.t + cH - ((v - minV) / range) * cH;

  // Grid lines
  ctx.strokeStyle = '#2e2e2e';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (i / 4) * cH;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cW, y); ctx.stroke();
    const label = (maxV - (i / 4) * range).toFixed(1);
    ctx.fillStyle = '#606060';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(label, pad.l - 4, y + 3);
  }

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
  grad.addColorStop(0, 'rgba(255,107,0,0.4)');
  grad.addColorStop(1, 'rgba(255,107,0,0)');
  ctx.beginPath();
  ctx.moveTo(xOf(0), yOf(data[0].val));
  data.forEach((d, i) => { if (i > 0) ctx.lineTo(xOf(i), yOf(d.val)); });
  ctx.lineTo(xOf(data.length - 1), pad.t + cH);
  ctx.lineTo(xOf(0), pad.t + cH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(xOf(0), yOf(data[0].val));
  data.forEach((d, i) => { if (i > 0) ctx.lineTo(xOf(i), yOf(d.val)); });
  ctx.strokeStyle = '#ff6b00';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Dots + date labels
  data.forEach((d, i) => {
    ctx.beginPath();
    ctx.arc(xOf(i), yOf(d.val), 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b00';
    ctx.fill();
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (i === 0 || i === data.length - 1) {
      ctx.fillStyle = '#888';
      ctx.font = '10px system-ui';
      ctx.textAlign = i === 0 ? 'left' : 'right';
      const lbl = d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      ctx.fillText(lbl, xOf(i), pad.t + cH + 14);
    }
  });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}
