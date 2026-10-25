const KEY = 'voicesadhana.v1';
const DAY_MS = 86_400_000;

export const localDate = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateKey = key => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(key || ''))) return null;
  const [year, month, day] = key.split('-').map(Number);
  const stamp = Date.UTC(year, month - 1, day);
  const date = new Date(stamp);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return stamp;
};
const daysBetween = (from, to) => {
  const a = parseDateKey(from), b = parseDateKey(to);
  return a === null || b === null ? null : Math.round((b - a) / DAY_MS);
};
const addDays = (key, amount) => {
  const stamp = parseDateKey(key);
  return stamp === null ? null : new Date(stamp + amount * DAY_MS).toISOString().slice(0, 10);
};

export function defaults() {
  return {
    onboarded: false,
    streakData: { current: 0, best: 0, lastCompletedDate: null, freezeTokens: 0, calendar: {} },
    progressData: {
      phonemes: {}, confirmedPhonemes: {}, tierGroups: {}, tier2Unlocked: false, tier3Unlocked: false, tier4Unlocked: false,
      matraWords: 0, conjunctWords: 0, readingSets: 0, xp: 0, level: 1,
      articulationToday: false, voiceToday: false, exercises: 0, words: 0,
    },
    settings: {
      theme: 'light', animationSpeed: 1,
      reducedMotion: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false,
      language: 'en', fontSize: 1, audioFeedback: true, mirror: false,
    },
    assessmentData: { concerns: [], baselinePitch: null },
    practiceHistory: [],
  };
}

export function loadState() {
  const base = defaults();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      ...base,
      ...saved,
      streakData: { ...base.streakData, ...(saved.streakData || {}), calendar: { ...base.streakData.calendar, ...(saved.streakData?.calendar || {}) } },
      progressData: { ...base.progressData, ...(saved.progressData || {}) },
      settings: { ...base.settings, ...(saved.settings || {}) },
      assessmentData: { ...base.assessmentData, ...(saved.assessmentData || {}) },
      practiceHistory: Array.isArray(saved.practiceHistory) ? saved.practiceHistory : base.practiceHistory,
    };
  } catch {
    return base;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function awardXP(state, amount, reason) {
  const oldLevel = Math.floor(state.progressData.xp / 100) + 1;
  state.progressData.xp += amount;
  state.progressData.level = Math.floor(state.progressData.xp / 100) + 1;
  state.practiceHistory.push({ date: localDate(), type: 'xp', amount, reason });
  saveState(state);
  return { levelUp: state.progressData.level > oldLevel };
}

function recordPractice(state, type, label) {
  const date = localDate();
  state.practiceHistory.push({ date, type, label });
  const current = state.streakData.calendar[date];
  if (current !== 'complete' && current !== 'rest') state.streakData.calendar[date] = 'partial';
  saveState(state);
}

export function recordArticulation(state, word, phonemes, confirmed = false) {
  const p = state.progressData;
  p.pendingArticulation = true;
  p.pendingPhonemes = phonemes
    .filter(x => x.char && /[\u0900-\u097f]/.test(x.char) && x.manner !== 'pause' && x.manner !== 'halant')
    .map(x => x.char);
  p.pendingMatra = phonemes.some(x => x.matra);
  p.pendingConjunct = phonemes.some(x => x.char === '्');
  if (confirmed) {
    p.articulationToday = true;
    p.pendingArticulation = false;
  }
  p.words++;
  for (const x of phonemes) {
    if (x.char && /[\u0900-\u097f]/.test(x.char) && x.manner !== 'pause' && x.manner !== 'halant') {
      p.phonemes[x.char] = (p.phonemes[x.char] || 0) + 1;
    }
  }
  const reward = awardXP(state, 10, 'articulation');
  recordPractice(state, 'articulation', word);
  return reward;
}

export function recordVoice(state, exercise) {
  state.progressData.voiceToday = true;
  state.progressData.exercises++;
  if (/paced Hindi reading/i.test(exercise)) state.progressData.readingSets = (state.progressData.readingSets || 0) + 1;
  const reward = awardXP(state, 15, 'voice');
  recordPractice(state, 'voice', exercise);
  return reward;
}

export function dailyGoalComplete(state) {
  return state.progressData.articulationToday && state.progressData.voiceToday;
}

function markGapDays(state, from, to, { applyTokens, continuous }) {
  const s = state.streakData;
  const gap = daysBetween(from, to);
  if (gap === null || gap <= 1) return { continuous: gap === 1 ? continuous : false };
  let unbroken = continuous;
  for (let offset = 1; offset < gap; offset++) {
    const key = addDays(from, offset);
    if (s.calendar[key] === 'complete' || s.calendar[key] === 'rest') continue;
    if (s.calendar[key] === 'missed') {
      unbroken = false;
      continue;
    }
    if (applyTokens && s.freezeTokens > 0) {
      s.freezeTokens--;
      s.calendar[key] = 'rest';
    } else {
      s.calendar[key] = 'missed';
      unbroken = false;
    }
  }
  return { continuous: unbroken };
}

export function syncDay(state, now = new Date()) {
  const today = localDate(now), s = state.streakData, last = s.lastCompletedDate;
  if (last === today || !dailyGoalComplete(state)) return false;

  let continuous = !last;
  if (last) {
    const gap = daysBetween(last, today);
    if (gap === 1) continuous = true;
    else if (gap !== null && gap > 1) continuous = markGapDays(state, last, today, { applyTokens: true, continuous: true }).continuous;
  }

  s.current = continuous ? s.current + 1 : 1;
  s.best = Math.max(s.best, s.current);
  s.lastCompletedDate = today;
  s.calendar[today] = 'complete';
  if (s.current > 0 && s.current % 7 === 0) s.freezeTokens = Math.min(3, s.freezeTokens + 1);
  awardXP(state, 30, 'daily goal');
  saveState(state);
  return true;
}

export function resetDailyFlagsIfNewDay(state, now = new Date()) {
  const today = localDate(now), p = state.progressData;
  if (p.flagDate === today) return;
  p.articulationToday = false;
  p.voiceToday = false;
  p.pendingArticulation = false;
  p.pendingPhonemes = [];
  p.pendingMatra = false;
  p.pendingConjunct = false;
  p.flagDate = today;
  saveState(state);
}

export function reconcileStreak(state, now = new Date()) {
  const s = state.streakData;
  if (!s.lastCompletedDate) return;
  const gap = daysBetween(s.lastCompletedDate, localDate(now));
  if (gap === null || gap <= 1) return;
  const result = markGapDays(state, s.lastCompletedDate, localDate(now), { applyTokens: true, continuous: true });
  if (!result.continuous) s.current = 0;
  saveState(state);
}

export function getCalendar(state, days = 30, now = new Date()) {
  const out = [];
  for (let n = days - 1; n >= 0; n--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - n, 12);
    const key = localDate(d);
    out.push({ date: key, day: d.getDate(), status: state.streakData.calendar[key] || 'empty', today: n === 0 });
  }
  return out;
}

export function getMonthCalendar(state, monthOffset = 0, now = new Date()) {
  const first = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1, 12);
  const year = first.getFullYear(), month = first.getMonth();
  const daysInMonth = new Date(year, month + 1, 0, 12).getDate();
  const todayKey = localDate(now);
  const activityDates = state.practiceHistory
    .filter(entry => ['articulation', 'voice'].includes(entry.type) && parseDateKey(entry.date) !== null)
    .map(entry => entry.date);
  if (state.streakData.lastCompletedDate && parseDateKey(state.streakData.lastCompletedDate) !== null) activityDates.push(state.streakData.lastCompletedDate);
  for (const [date, status] of Object.entries(state.streakData.calendar)) {
    if (status !== 'empty' && parseDateKey(date) !== null) activityDates.push(date);
  }
  const firstActivity = activityDates.sort()[0] || null;
  const offset = (first.getDay() + 6) % 7;
  const cells = Array.from({ length: offset }, () => ({ empty: true }));
  for (let day = 1; day <= daysInMonth; day++) {
    const date = localDate(new Date(year, month, day, 12));
    const saved = state.streakData.calendar[date];
    let status = saved || 'empty';
    if (date > todayKey) status = 'future';
    else if (!saved && activityDates.includes(date)) status = 'partial';
    else if (!saved && firstActivity && date >= firstActivity && date < todayKey) status = 'missed';
    cells.push({ date, day, status, today: date === todayKey });
  }
  const weekdayFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });
  const weekdays = Array.from({ length: 7 }, (_, i) => weekdayFormatter.format(new Date(2024, 0, 1 + i, 12)));
  return {
    year,
    month,
    monthOffset,
    monthLabel: new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(first),
    weekdays,
    cells,
    daysInMonth,
    todayKey,
    completeCount: cells.filter(cell => cell.status === 'complete').length,
    partialCount: cells.filter(cell => cell.status === 'partial').length,
  };
}

export function tierStatus(state) {
  const groups = ['क-वर्ग', 'च-वर्ग', 'ट-वर्ग', 'त-वर्ग', 'प-वर्ग'];
  const completed = groups.filter(g => state.progressData.tierGroups[g]).length;
  return [
    { name: 'Foundation', hi: 'नींव', unlocked: true, done: completed >= 5, description: 'Individual sound placement · self-reported correct ×3', progress: `${completed}/5 varga groups` },
    { name: 'Combination', hi: 'संयोग', unlocked: !!state.progressData.tier2Unlocked, done: !!state.progressData.tier2, description: 'Consonant + matra transitions', progress: `${state.progressData.matraWords || 0}/10 correct matra words` },
    { name: 'Conjuncts', hi: 'संयुक्त', unlocked: !!state.progressData.tier3Unlocked, done: !!state.progressData.tier3, description: 'Connected conjunct sequences', progress: `${state.progressData.conjunctWords || 0}/10 correct conjunct words` },
    { name: 'Fluency', hi: 'प्रवाह', unlocked: !!state.progressData.tier4Unlocked, done: !!state.progressData.tier4, description: 'Paced reading & calm delivery', progress: `${state.progressData.readingSets || 0}/10 reading sets · ${state.streakData.best}/14 best streak` },
  ];
}
