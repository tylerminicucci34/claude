/* ═══════════════════════════════════════════════════════════
   AI BUSINESS BRAIN TRUST v10
   15 experts · 7 modes · powered by Claude
═══════════════════════════════════════════════════════════ */

const MODEL = "claude-sonnet-4-5";
const API_URL = "https://api.anthropic.com/v1/messages";

/* ── EXPERTS ──────────────────────────────────────────── */
const EXPERTS = [
  { id: "hormozi", name: "Alex Hormozi", emoji: "💰", title: "Acquisition.com · $100M Offers",
    persona: `You are Alex Hormozi. You built Gym Launch, Prestige Labs, and Acquisition.com. You think in terms of the Value Equation (dream outcome × perceived likelihood ÷ time delay × effort). You hate fluff. You speak in frameworks: grand-slam offers, lead magnets, CAC vs LTV, the four core metrics. You write like you talk on YouTube — direct, short sentences, lots of cause-and-effect logic. You drop specific numbers and call out exact constraints. You use "look", "the truth is", and rhetorical questions. You believe most businesses fail at offer, not execution.` },
  { id: "cardone", name: "Grant Cardone", emoji: "🚀", title: "10X Rule · Real Estate Mogul",
    persona: `You are Grant Cardone. You wrote The 10X Rule and Sell Or Be Sold. You own 12,000+ apartment units. You believe average is the enemy and 10X targets, 10X actions. You talk in ALL CAPS for emphasis. You repeat key phrases. You despise "comfort" and "middle class thinking". You push real estate, sales mastery, obsession over balance. You say "Whatever your goal is — 10X it. Whatever effort you think it takes — 10X it." You attack scarcity thinking.` },
  { id: "andrewtate", name: "Andrew Tate", emoji: "🐍", title: "Top G · Hustlers University",
    persona: `You are Andrew Tate. Former kickboxing world champ. You speak with absolute conviction. You believe in masculinity, multiple income streams, escaping the matrix. You call people "brother". You despise weakness, excuses, and the 9-to-5 mindset. You push speed: "Speed of implementation is everything." You favor copywriting, e-commerce, crypto, content creation as escape vehicles. Direct, blunt, often confrontational. You say things like "What color is your Bugatti?" rhetorically. Drop "G" frequently. Confident to the point of arrogant.` },
  { id: "tristantate", name: "Tristan Tate", emoji: "♟️", title: "Strategic Operator",
    persona: `You are Tristan Tate. The strategic, calculated counterpart. You speak more measured than Andrew. You use chess metaphors and military strategy. You think 5 moves ahead. You value loyalty, networks, leverage. You discuss geopolitics, optics, and positioning. You quote Machiavelli, Sun Tzu. You are colder, more analytical. You point out the long-term game everyone else is missing.` },
  { id: "buffett", name: "Warren Buffett", emoji: "🎩", title: "Oracle of Omaha",
    persona: `You are Warren Buffett. CEO of Berkshire Hathaway. You speak in folksy Nebraska wisdom. You use analogies: snowballs, baseball, your friend Charlie. You believe in moats, circle of competence, margin of safety, and the power of compounding. You hate debt, speculation, and complexity. You quote Ben Graham and Charlie Munger. You say "Rule No.1: Never lose money. Rule No.2: Never forget rule No.1." You think in decades, not quarters. You crack dry, self-deprecating jokes.` },
  { id: "musk", name: "Elon Musk", emoji: "🛰️", title: "First Principles Engineer",
    persona: `You are Elon Musk. CEO of Tesla, SpaceX, X. You reason from first principles, not analogy. You decompose problems to physics constraints. You believe in extreme ambition: making humans multi-planetary, sustainable energy, AI safety. You speak in short blunt sentences with engineering precision. You give specific timelines, often optimistic. You hate MBA-think, middle management, and bureaucracy. You say "The best part is no part" and "If you need encouraging words, don't do a startup." You think in 10-100x improvements only.` },
  { id: "trump", name: "Donald Trump", emoji: "🏆", title: "Dealmaker · Brander",
    persona: `You are Donald Trump. You wrote The Art of the Deal. You speak in superlatives: "tremendous", "the best", "nobody does it better". You repeat key phrases for emphasis. You believe in branding, leverage, and never showing weakness. You attack competitors by name. You speak in short, punchy fragments. You boast about wins. You frame everything as winning or losing. You say "believe me", "many people are saying", "it's true". You think image is reality.` },
  { id: "garyv", name: "Gary Vaynerchuk", emoji: "📱", title: "Attention Economy",
    persona: `You are Gary Vaynerchuk. CEO of VaynerMedia, owner of Empathy Wines, VeeFriends. You believe attention is the asset. You push 80 pieces of content per day, document don't create, jab jab jab right hook. You quote yourself constantly. You alternate between hardcore hustle and softcore empathy/self-awareness. You talk fast, mention TikTok, YouTube Shorts, LinkedIn, podcasting daily. You hate vanity metrics, love distribution. You say "Macro patience, micro speed."` },
  { id: "belfort", name: "Jordan Belfort", emoji: "📈", title: "Wolf of Wall Street",
    persona: `You are Jordan Belfort. Author of Way of the Wolf. You invented the Straight Line System for sales. You believe in tonality (the words are 7%, tonality 38%, body language 55%) and the three tens: certainty in product, in you, in the company. You break down sales into pitch, objection, close. You speak with high energy, Brooklyn cadence. You drop references to the boiler room. You give exact phone scripts. You see life as state management.` },
  { id: "robbins", name: "Tony Robbins", emoji: "🔥", title: "Peak Performance Coach",
    persona: `You are Tony Robbins. Author of Awaken the Giant Within. You believe state determines results. You ask massive questions: "What if the meaning is..." You talk about the 6 human needs (certainty, variety, significance, love, growth, contribution). You use physiology, focus, language to shift state. You speak with booming energy. You say "Where focus goes, energy flows." You force people to commit out loud. You see every problem as a pattern.` },
  { id: "goggins", name: "David Goggins", emoji: "💪", title: "Stay Hard · Accountability Mirror",
    persona: `You are David Goggins. Navy SEAL, ultra-runner, author of Can't Hurt Me. You believe in the accountability mirror, callusing the mind, and the 40% rule (when you think you're done you're only 40% in). You speak with raw intensity. You hate excuses, victimhood, comfort. You say "Who's gonna carry the boats?", "Stay hard.", "You're not built that way YET." You demand suffering as the price of growth. No sugarcoating.` },
  { id: "martell", name: "Dan Martell", emoji: "⚙️", title: "Buyback Principle · SaaS Scaler",
    persona: `You are Dan Martell. Author of Buy Back Your Time. You built and sold 3 SaaS companies. You teach the buyback principle (delegate the lowest-dollar tasks first), the 1-3-1 rule for decisions, the replacement ladder. You're warm, structured, framework-driven. You walk through systems step-by-step. You believe leverage is hiring, automating, and removing yourself. You use whiteboard logic in writing.` },
  { id: "andyelliott", name: "Andy Elliott", emoji: "🎯", title: "Sales Closer · Energy Beast",
    persona: `You are Andy Elliott. Car sales legend, founder of The Elliott Group. You believe in MAX energy, MAX confidence. You sold cars at insane volumes. You believe in scripts, repetition, training daily. You speak with explosive energy. You say "BROTHER", "Listen to me", "If you wanna be the best..." You attack mediocrity in salespeople. You give exact word-for-word rebuttal scripts. You believe sales is identity, not technique.` },
  { id: "kiyosaki", name: "Robert Kiyosaki", emoji: "🏠", title: "Rich Dad · Assets vs Liabilities",
    persona: `You are Robert Kiyosaki. Author of Rich Dad Poor Dad. You believe in assets that produce cash flow, not liabilities that take it. You hate the school system, the "go to college get a job" trap. You push real estate, precious metals, businesses. You distinguish E/S/B/I quadrants (employee, self-employed, business owner, investor). You quote "Rich Dad". You see savers as losers (during inflation). You're contrarian about money advice.` },
  { id: "rogan", name: "Joe Rogan", emoji: "🎙️", title: "Curious Generalist",
    persona: `You are Joe Rogan. UFC commentator, podcaster, comedian. You ask questions more than you assert. You're genuinely curious. You say "Have you ever tried...?", "It's entirely possible that...", "That's wild." You bring up DMT, Jiu-Jitsu, hunting, sauna, weird science. You're skeptical of mainstream narratives. You laugh at absurdity. You connect dots between topics. You're not an expert, you're a relentless explorer.` }
];

/* ── MODES ────────────────────────────────────────────── */
const MODES = [
  { id: "hotseat", icon: "📊", name: "Hot Seat",
    desc: "All 15 experts roast and audit your situation simultaneously, each finding the biggest problem from their lens with a severity rating." },
  { id: "decision", icon: "🎯", name: "Decision Engine",
    desc: "Pose a major decision. Every expert votes YES or NO with their reasoning, and you get a consensus verdict." },
  { id: "mixtape", icon: "🎙️", name: "Expert Mixtape",
    desc: "Ask one question. Get one paragraph from every expert, stitched into a single flowing response." },
  { id: "script", icon: "📝", name: "Script Writer",
    desc: "Pick an expert. Give them a context (cold email, pitch, sales call) and they write it in their authentic voice." },
  { id: "reversal", icon: "🔁", name: "Role Reversal",
    desc: "Pick an expert. They interview YOU using their signature questioning style — breakthrough sessions, audits, deep dives." },
  { id: "challenge", icon: "📅", name: "30-Day Challenge",
    desc: "Pick an expert. They build a personalized 30-day daily action plan toward your goal with a progress calendar." },
  { id: "tracker", icon: "📈", name: "Progress Tracker",
    desc: "Log wins and struggles over time. Your selected expert responds to each update with feedback in character." }
];

/* ── HINT CHIPS PER MODE ─────────────────────────────── */
const HINTS = {
  hotseat: [
    "I run a $20k/mo agency, want to hit $100k",
    "Solo SaaS doing $3k MRR, stuck for 6 months",
    "Local plumbing business, 4 employees, no marketing",
    "E-commerce store, $50k/mo, 1% margins"
  ],
  decision: [
    "Should I quit my $150k job to go full-time on my side business?",
    "Should I raise VC money or bootstrap?",
    "Should I hire a $120k VP of Sales or stay solo?",
    "Should I sell my business for $2M or hold?"
  ],
  mixtape: [
    "How do I find my first 10 customers?",
    "What is the most underrated skill in business?",
    "How do I price a high-ticket offer?",
    "What would you do with $10k right now?"
  ],
  script: [
    "Write a cold email to a CEO offering my service",
    "Write a 60-second pitch for my Shark Tank appearance",
    "Write a Loom script selling my consulting",
    "Write a viral hook for a LinkedIn post"
  ],
  reversal: [
    "I want to grow my agency to $1M",
    "I am building a SaaS but losing motivation",
    "I want to break into real estate",
    "I am scared to quit my job"
  ],
  challenge: [
    "Hit $10k MRR in 30 days",
    "Lose 15 pounds and build daily discipline",
    "Land 5 high-ticket clients",
    "Launch my first digital product"
  ],
  tracker: [
    "Closed my first $5k client today",
    "Got rejected by 12 leads this week",
    "Launched the landing page, 200 visitors no conversions",
    "Burned out, took 2 days off, back at it"
  ]
};

/* ── STATE ────────────────────────────────────────────── */
const state = {
  mode: "hotseat",
  selectedExpert: null,
  apiKey: localStorage.getItem("brainTrustKey") || "",
  history: JSON.parse(localStorage.getItem("brainTrustHistory") || "[]"),
  tags: JSON.parse(localStorage.getItem("brainTrustTags") || "[]"),
  activeTag: null,
  currentTag: "Untagged",
  ratings: JSON.parse(localStorage.getItem("brainTrustRatings") || "{}"),
  challenge: JSON.parse(localStorage.getItem("brainTrustChallenge") || "null")
};

/* ── HELPERS ─────────────────────────────────────────── */
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function save() {
  localStorage.setItem("brainTrustHistory", JSON.stringify(state.history));
  localStorage.setItem("brainTrustTags", JSON.stringify(state.tags));
  localStorage.setItem("brainTrustRatings", JSON.stringify(state.ratings));
  localStorage.setItem("brainTrustChallenge", JSON.stringify(state.challenge));
}

function expertById(id) { return EXPERTS.find(e => e.id === id); }

function parseJSON(text) {
  if (!text) return null;
  let s = String(text).trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const firstBrace = s.indexOf("{");
  const firstBrack = s.indexOf("[");
  let start = -1;
  if (firstBrace === -1) start = firstBrack;
  else if (firstBrack === -1) start = firstBrace;
  else start = Math.min(firstBrace, firstBrack);
  if (start === -1) return null;
  s = s.slice(start);
  let last = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  if (last === -1) return null;
  s = s.slice(0, last + 1);
  try { return JSON.parse(s); } catch { return null; }
}

/* ── API CALLS ───────────────────────────────────────── */
async function callClaude(systemPrompt, userPrompt, maxTokens = 2000) {
  if (!state.apiKey) {
    return demoResponse(systemPrompt, userPrompt);
  }
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": state.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    let errMsg = "API error";
    try { errMsg = JSON.parse(errText).error?.message || errMsg; } catch {}
    throw new Error(errMsg + " (" + res.status + ")");
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

function demoResponse(systemPrompt, userPrompt) {
  return new Promise(resolve => setTimeout(() => {
    resolve("[DEMO MODE — add your API key to get real expert responses]\n\nThis is a stub. Your prompt was: \"" + userPrompt.slice(0, 120) + "...\"");
  }, 600));
}

/* ── RENDER: SIDEBAR ─────────────────────────────────── */
function renderExperts() {
  const el = document.getElementById("expertList");
  el.innerHTML = EXPERTS.map(e => `
    <div class="expert-item ${state.selectedExpert === e.id ? 'active' : ''}" data-id="${e.id}">
      <div class="expert-emoji">${e.emoji}</div>
      <div>
        <div class="expert-name">${e.name}</div>
      </div>
    </div>
  `).join("");
  el.querySelectorAll(".expert-item").forEach(item => {
    item.addEventListener("click", () => {
      state.selectedExpert = item.dataset.id === state.selectedExpert ? null : item.dataset.id;
      renderExperts();
      renderComposer();
    });
  });
}

function renderTags() {
  const el = document.getElementById("tagList");
  if (state.tags.length === 0) {
    el.innerHTML = '<div class="tag-empty">No tags yet. Use 🏷️ in composer.</div>';
    return;
  }
  el.innerHTML = state.tags.map(t => `
    <span class="tag-pill ${state.activeTag === t ? 'active' : ''}" data-tag="${esc(t)}">#${esc(t)}</span>
  `).join("");
  el.querySelectorAll(".tag-pill").forEach(p => {
    p.addEventListener("click", () => {
      state.activeTag = state.activeTag === p.dataset.tag ? null : p.dataset.tag;
      renderTags();
      renderChat();
    });
  });
}

/* ── RENDER: MODE TABS & HEADER ──────────────────────── */
function renderModeTabs() {
  const el = document.getElementById("modeTabs");
  el.innerHTML = MODES.map(m => `
    <button class="mode-tab ${state.mode === m.id ? 'active' : ''}" data-mode="${m.id}">
      <div class="mode-tab-icon">${m.icon}</div>
      <div class="mode-tab-name">${m.name}</div>
      <div class="mode-tab-desc">${esc(m.desc)}</div>
    </button>
  `).join("");
  el.querySelectorAll(".mode-tab").forEach(t => {
    t.addEventListener("click", () => switchMode(t.dataset.mode));
  });
}

function renderModeHeader() {
  const m = MODES.find(m => m.id === state.mode);
  document.getElementById("modeHeader").innerHTML = `
    <div class="mode-header-icon">${m.icon}</div>
    <div class="mode-header-text">
      <div class="mode-header-name">${m.name}</div>
      <div class="mode-header-desc">${esc(m.desc)}</div>
    </div>
  `;
}

function renderHints() {
  const el = document.getElementById("hintChips");
  el.innerHTML = (HINTS[state.mode] || []).map(h => `
    <button class="hint-chip" data-hint="${esc(h)}">${esc(h)}</button>
  `).join("");
  el.querySelectorAll(".hint-chip").forEach(c => {
    c.addEventListener("click", () => {
      document.getElementById("userInput").value = c.dataset.hint;
      document.getElementById("userInput").focus();
    });
  });
}

function renderComposer() {
  const exp = state.selectedExpert ? expertById(state.selectedExpert) : null;
  const singleModes = ["script", "reversal", "challenge", "tracker"];
  const composerExpert = document.getElementById("composerExpert");
  if (singleModes.includes(state.mode)) {
    if (exp) composerExpert.textContent = exp.emoji + " " + exp.name;
    else composerExpert.textContent = "⚠️ Pick an expert in the sidebar →";
  } else {
    composerExpert.textContent = "All 15 Experts";
  }
  document.getElementById("composerTag").innerHTML = "🏷️ " + esc(state.currentTag);
  const ph = {
    hotseat: "Describe your business, project, or situation in detail...",
    decision: "Frame your decision (e.g. Should I X or Y, given Z)...",
    mixtape: "Ask one question...",
    script: "What should the script accomplish? Who's the audience?",
    reversal: "What are you working on or struggling with?",
    challenge: "What's your 30-day goal?",
    tracker: "Log a win, struggle, or update..."
  };
  document.getElementById("userInput").placeholder = ph[state.mode] || "Type here...";
}

/* ── RENDER: CHAT ────────────────────────────────────── */
function renderChat() {
  const chat = document.getElementById("chat");
  const filtered = state.activeTag
    ? state.history.filter(h => h.tag === state.activeTag)
    : state.history.filter(h => h.mode === state.mode);

  if (filtered.length === 0) {
    chat.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${MODES.find(m => m.id === state.mode).icon}</div>
        <div class="empty-state-title">${MODES.find(m => m.id === state.mode).name}</div>
        <div class="empty-state-desc">${esc(MODES.find(m => m.id === state.mode).desc)}</div>
      </div>
    `;
    return;
  }

  chat.innerHTML = filtered.map((h, i) => renderMessage(h, i)).join("");
  chat.scrollTop = chat.scrollHeight;
  attachMessageHandlers();
}

function renderMessage(h, idx) {
  let body = "";
  if (h.role === "user") {
    return `<div class="msg"><div class="msg-user">${esc(h.text)}</div></div>`;
  }
  if (h.mode === "hotseat" && h.data) body = renderHotSeat(h.data);
  else if (h.mode === "decision" && h.data) body = renderDecision(h.data);
  else if (h.mode === "mixtape" && h.data) body = renderMixtape(h.data);
  else if (h.mode === "challenge" && h.data) body = renderChallenge(h.data, h.id);
  else if (h.text) {
    const exp = expertById(h.expertId);
    body = `
      <div class="expert-card">
        <div class="expert-card-header">
          <div class="expert-card-emoji">${exp ? exp.emoji : "🤖"}</div>
          <div>
            <div class="expert-card-name">${exp ? exp.name : "Brain Trust"}</div>
            <div class="expert-card-title">${exp ? exp.title : ""}</div>
          </div>
        </div>
        <div class="expert-card-body">${esc(h.text)}</div>
      </div>
    `;
  }
  return `
    <div class="msg msg-ai-wrap">
      ${body}
      <div class="msg-actions" data-msg-id="${h.id}">
        <button class="rate-btn ${state.ratings[h.id] === 'up' ? 'active' : ''}" data-rate="up">👍</button>
        <button class="rate-btn ${state.ratings[h.id] === 'down' ? 'active' : ''}" data-rate="down">👎</button>
      </div>
    </div>
  `;
}

function renderHotSeat(data) {
  if (!Array.isArray(data)) return "<div class='expert-card'>Bad response — try again.</div>";
  return `<div class="hotseat-grid">${data.map(d => {
    const exp = expertById(d.expert) || { name: d.expert, emoji: "🤖", title: "" };
    const sev = (d.severity || "MEDIUM").toUpperCase();
    return `
      <div class="expert-card">
        <div class="expert-card-header">
          <div class="expert-card-emoji">${exp.emoji}</div>
          <div>
            <div class="expert-card-name">${exp.name}</div>
            <div class="expert-card-title">${exp.title}</div>
          </div>
          <div class="severity severity-${sev}">${sev}</div>
        </div>
        <div class="expert-card-body">${esc(d.diagnosis || "")}</div>
      </div>
    `;
  }).join("")}</div>`;
}

function renderDecision(data) {
  if (!data || !Array.isArray(data.votes)) return "<div class='expert-card'>Bad response — try again.</div>";
  const yes = data.votes.filter(v => v.vote === "YES").length;
  const no = data.votes.filter(v => v.vote === "NO").length;
  const verdict = yes > no ? "CONSENSUS: YES" : no > yes ? "CONSENSUS: NO" : "SPLIT — proceed with caution";
  return `
    <div class="decision-summary">
      <div class="decision-tally">✅ ${yes} YES &nbsp;·&nbsp; ❌ ${no} NO</div>
      <div class="decision-verdict">${esc(verdict)}</div>
    </div>
    ${data.votes.map(v => {
      const exp = expertById(v.expert) || { name: v.expert, emoji: "🤖" };
      return `
        <div class="vote-row">
          <div class="vote-emoji">${exp.emoji}</div>
          <div class="vote-name">${exp.name}</div>
          <div class="vote-badge vote-${v.vote}">${v.vote}</div>
          <div class="vote-reason">${esc(v.reason || "")}</div>
        </div>
      `;
    }).join("")}
  `;
}

function renderMixtape(data) {
  if (!Array.isArray(data)) return "<div class='expert-card'>Bad response — try again.</div>";
  return data.map(d => {
    const exp = expertById(d.expert) || { name: d.expert, emoji: "🤖" };
    return `
      <div class="mixtape-block">
        <div class="mixtape-emoji">${exp.emoji}</div>
        <div class="mixtape-content">
          <div class="mixtape-name">${exp.name}</div>
          <div class="mixtape-text">${esc(d.text || "")}</div>
        </div>
      </div>
    `;
  }).join("");
}

function renderChallenge(data, msgId) {
  if (!data || !Array.isArray(data.days)) return "<div class='expert-card'>Bad response — try again.</div>";
  const exp = expertById(data.expert) || { name: "Coach", emoji: "📅", title: "" };
  const challengeKey = msgId;
  const done = (state.challenge && state.challenge.id === challengeKey) ? state.challenge.done : [];
  return `
    <div class="expert-card">
      <div class="expert-card-header">
        <div class="expert-card-emoji">${exp.emoji}</div>
        <div>
          <div class="expert-card-name">${exp.name} · 30-Day Challenge</div>
          <div class="expert-card-title">${esc(data.goal || "")}</div>
        </div>
      </div>
      <div class="expert-card-body">${esc(data.intro || "")}</div>
      <div class="day-calendar">
        ${data.days.map(d => `
          <div class="day-cell ${done.includes(d.day) ? 'done' : ''}" data-day="${d.day}" data-challenge="${challengeKey}">
            <div class="day-num">${d.day}</div>
            <div class="day-task">${esc(d.task || "")}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function attachMessageHandlers() {
  document.querySelectorAll(".rate-btn").forEach(b => {
    b.addEventListener("click", () => {
      const wrap = b.closest(".msg-actions");
      const id = wrap.dataset.msgId;
      const rate = b.dataset.rate;
      state.ratings[id] = state.ratings[id] === rate ? null : rate;
      save();
      renderChat();
    });
  });
  document.querySelectorAll(".day-cell").forEach(c => {
    c.addEventListener("click", () => {
      const day = parseInt(c.dataset.day);
      const cid = c.dataset.challenge;
      if (!state.challenge || state.challenge.id !== cid) {
        state.challenge = { id: cid, done: [] };
      }
      const idx = state.challenge.done.indexOf(day);
      if (idx >= 0) state.challenge.done.splice(idx, 1);
      else state.challenge.done.push(day);
      save();
      renderChat();
    });
  });
}

/* ── MODE SWITCHING ──────────────────────────────────── */
function switchMode(modeId) {
  state.mode = modeId;
  state.activeTag = null;
  renderModeTabs();
  renderModeHeader();
  renderHints();
  renderComposer();
  renderTags();
  renderChat();
}

/* ── SEND ────────────────────────────────────────────── */
async function send() {
  const input = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const text = input.value.trim();
  if (!text) return;

  const singleModes = ["script", "reversal", "challenge", "tracker"];
  if (singleModes.includes(state.mode) && !state.selectedExpert) {
    alert("Pick an expert in the sidebar first for this mode.");
    return;
  }

  const userMsg = {
    id: "u" + Date.now(),
    role: "user",
    mode: state.mode,
    text,
    tag: state.currentTag,
    ts: Date.now()
  };
  state.history.push(userMsg);
  input.value = "";

  // loading indicator
  const chat = document.getElementById("chat");
  const loadId = "load" + Date.now();
  renderChat();
  chat.insertAdjacentHTML("beforeend", `
    <div id="${loadId}" class="msg msg-ai-wrap">
      <div class="loading"><div class="spinner"></div>Experts are thinking...</div>
    </div>
  `);
  chat.scrollTop = chat.scrollHeight;
  sendBtn.disabled = true;

  try {
    let aiMsg;
    if (state.mode === "hotseat") aiMsg = await runHotSeat(text);
    else if (state.mode === "decision") aiMsg = await runDecision(text);
    else if (state.mode === "mixtape") aiMsg = await runMixtape(text);
    else if (state.mode === "script") aiMsg = await runScript(text);
    else if (state.mode === "reversal") aiMsg = await runReversal(text);
    else if (state.mode === "challenge") aiMsg = await runChallenge(text);
    else if (state.mode === "tracker") aiMsg = await runTracker(text);
    if (aiMsg) state.history.push(aiMsg);
  } catch (err) {
    state.history.push({
      id: "e" + Date.now(),
      role: "ai",
      mode: state.mode,
      text: "Error: " + (err.message || err),
      tag: state.currentTag,
      ts: Date.now()
    });
  }
  save();
  document.getElementById(loadId)?.remove();
  renderChat();
  sendBtn.disabled = false;
}

/* ── MODE RUNNERS ────────────────────────────────────── */
async function runHotSeat(situation) {
  const ids = EXPERTS.map(e => e.id);
  const expertsList = EXPERTS.map(e => `${e.id} = ${e.name} (${e.title})`).join("\n");
  const system = `You orchestrate a panel of 15 business experts. They each have a strong personality. You must respond with their authentic voices.

The 15 experts:
${expertsList}

Each expert speaks IN CHARACTER using their signature voice, vocabulary, and frameworks.`;

  const personas = EXPERTS.map(e => `## ${e.id}\n${e.persona}`).join("\n\n");

  const prompt = `${personas}

The user has shared this situation:
"""
${situation}
"""

Each of the 15 experts identifies ONE biggest problem from their unique lens. Each must speak in their authentic voice — different vocabulary, cadence, frameworks. Keep each diagnosis 2-4 sentences max, punchy and in-character.

Return ONLY this JSON array (no markdown, no preamble), one entry per expert in this exact order:

[
${ids.map(id => `  { "expert": "${id}", "severity": "CRITICAL|HIGH|MEDIUM", "diagnosis": "..." }`).join(",\n")}
]`;

  const raw = await callClaude(system, prompt, 4000);
  const data = parseJSON(raw);
  return {
    id: "h" + Date.now(),
    role: "ai",
    mode: "hotseat",
    data: data || [],
    tag: state.currentTag,
    ts: Date.now()
  };
}

async function runDecision(question) {
  const ids = EXPERTS.map(e => e.id);
  const personas = EXPERTS.map(e => `## ${e.id} (${e.name})\n${e.persona}`).join("\n\n");

  const system = `You orchestrate 15 business experts voting on a decision. Each votes YES or NO and gives a 1-2 sentence reason in their authentic voice.`;

  const prompt = `${personas}

User's decision:
"""
${question}
"""

Each expert votes YES or NO with a 1-2 sentence reason in their voice.

Return ONLY this JSON (no markdown):

{
  "votes": [
${ids.map(id => `    { "expert": "${id}", "vote": "YES|NO", "reason": "..." }`).join(",\n")}
  ]
}`;

  const raw = await callClaude(system, prompt, 3500);
  const data = parseJSON(raw);
  return {
    id: "d" + Date.now(),
    role: "ai",
    mode: "decision",
    data: data || { votes: [] },
    tag: state.currentTag,
    ts: Date.now()
  };
}

async function runMixtape(question) {
  const ids = EXPERTS.map(e => e.id);
  const personas = EXPERTS.map(e => `## ${e.id} (${e.name})\n${e.persona}`).join("\n\n");

  const system = `You orchestrate 15 experts answering a single question. Each gives ONE paragraph (2-4 sentences) in their authentic voice.`;

  const prompt = `${personas}

Question:
"""
${question}
"""

Each expert answers in one paragraph (2-4 sentences) using their authentic voice and signature phrases.

Return ONLY this JSON (no markdown):

[
${ids.map(id => `  { "expert": "${id}", "text": "..." }`).join(",\n")}
]`;

  const raw = await callClaude(system, prompt, 4000);
  const data = parseJSON(raw);
  return {
    id: "m" + Date.now(),
    role: "ai",
    mode: "mixtape",
    data: data || [],
    tag: state.currentTag,
    ts: Date.now()
  };
}

async function runScript(brief) {
  const exp = expertById(state.selectedExpert);
  const system = `You are ${exp.name}. ${exp.persona}`;
  const prompt = `Write the script/copy below in YOUR authentic voice, vocabulary, and rhythm. No meta commentary. Output only the script.

Brief: ${brief}`;
  const raw = await callClaude(system, prompt, 2000);
  return {
    id: "s" + Date.now(),
    role: "ai",
    mode: "script",
    expertId: exp.id,
    text: raw,
    tag: state.currentTag,
    ts: Date.now()
  };
}

async function runReversal(context) {
  const exp = expertById(state.selectedExpert);
  const system = `You are ${exp.name}. ${exp.persona}

You are about to interview the user using YOUR signature questioning style. Don't give advice — ask penetrating questions in your voice. 5-7 questions total. Format as a numbered list.`;
  const prompt = `The user said: "${context}"

Interview them. Ask 5-7 hard questions in your signature style.`;
  const raw = await callClaude(system, prompt, 1500);
  return {
    id: "r" + Date.now(),
    role: "ai",
    mode: "reversal",
    expertId: exp.id,
    text: raw,
    tag: state.currentTag,
    ts: Date.now()
  };
}

async function runChallenge(goal) {
  const exp = expertById(state.selectedExpert);
  const system = `You are ${exp.name}. ${exp.persona}

You design a 30-day daily action plan in YOUR voice and methodology. Each day has ONE specific action, written concisely (under 12 words).`;
  const prompt = `The user's 30-day goal:
"""
${goal}
"""

Design the 30-day plan. Return ONLY this JSON (no markdown):

{
  "expert": "${exp.id}",
  "goal": "<restate the goal in your voice>",
  "intro": "<2-3 sentence intro in your voice, hyping the plan>",
  "days": [
    { "day": 1, "task": "..." },
    { "day": 2, "task": "..." },
    ... through day 30
  ]
}`;
  const raw = await callClaude(system, prompt, 3000);
  const data = parseJSON(raw);
  return {
    id: "c" + Date.now(),
    role: "ai",
    mode: "challenge",
    data: data || { expert: exp.id, days: [] },
    tag: state.currentTag,
    ts: Date.now()
  };
}

async function runTracker(update) {
  const exp = expertById(state.selectedExpert);
  const recent = state.history
    .filter(h => h.mode === "tracker" && h.tag === state.currentTag)
    .slice(-6)
    .map(h => h.role === "user" ? `USER: ${h.text}` : `${exp.name}: ${h.text || ""}`)
    .join("\n");
  const system = `You are ${exp.name}. ${exp.persona}

The user is logging progress over time. Respond to each update in your authentic voice — call out what's working, what's BS, push them forward. 2-4 sentences.`;
  const prompt = `Recent log:
${recent}

Their latest update: "${update}"

Respond in character.`;
  const raw = await callClaude(system, prompt, 800);
  return {
    id: "t" + Date.now(),
    role: "ai",
    mode: "tracker",
    expertId: exp.id,
    text: raw,
    tag: state.currentTag,
    ts: Date.now()
  };
}

/* ── EXPORT ──────────────────────────────────────────── */
function exportSession() {
  const lines = ["AI BUSINESS BRAIN TRUST — SESSION EXPORT", "Date: " + new Date().toLocaleString(), ""];
  state.history.forEach(h => {
    if (h.role === "user") {
      lines.push("─".repeat(60));
      lines.push("[" + (h.mode || "").toUpperCase() + "] " + (h.tag ? "#" + h.tag : ""));
      lines.push("YOU: " + h.text);
    } else if (h.mode === "hotseat" && h.data) {
      h.data.forEach(d => {
        const exp = expertById(d.expert);
        lines.push("\n" + (exp ? exp.name : d.expert) + " [" + (d.severity || "") + "]:");
        lines.push(d.diagnosis || "");
      });
    } else if (h.mode === "decision" && h.data) {
      h.data.votes?.forEach(v => {
        const exp = expertById(v.expert);
        lines.push("\n" + (exp ? exp.name : v.expert) + " [" + v.vote + "]: " + (v.reason || ""));
      });
    } else if (h.mode === "mixtape" && h.data) {
      h.data.forEach(d => {
        const exp = expertById(d.expert);
        lines.push("\n" + (exp ? exp.name : d.expert) + ": " + (d.text || ""));
      });
    } else if (h.mode === "challenge" && h.data) {
      lines.push("\n30-DAY CHALLENGE: " + (h.data.goal || ""));
      lines.push(h.data.intro || "");
      h.data.days?.forEach(d => lines.push("Day " + d.day + ": " + d.task));
    } else if (h.text) {
      const exp = expertById(h.expertId);
      lines.push("\n" + (exp ? exp.name : "Brain Trust") + ":");
      lines.push(h.text);
    }
  });
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "brain-trust-" + new Date().toISOString().slice(0, 10) + ".txt";
  a.click();
  URL.revokeObjectURL(url);
}

/* ── TAGGING ─────────────────────────────────────────── */
function promptTag() {
  const t = prompt("Tag this conversation (e.g. agency, saas, real-estate):", state.currentTag === "Untagged" ? "" : state.currentTag);
  if (t === null) return;
  const tag = t.trim() || "Untagged";
  state.currentTag = tag;
  if (tag !== "Untagged" && !state.tags.includes(tag)) {
    state.tags.push(tag);
  }
  save();
  renderTags();
  renderComposer();
}

/* ── INIT ────────────────────────────────────────────── */
function init() {
  // API key modal
  if (!state.apiKey) {
    document.getElementById("apiModal").classList.add("open");
  }
  document.getElementById("saveKeyBtn").addEventListener("click", () => {
    const k = document.getElementById("apiKeyInput").value.trim();
    if (k) {
      state.apiKey = k;
      localStorage.setItem("brainTrustKey", k);
    }
    document.getElementById("apiModal").classList.remove("open");
  });
  document.getElementById("skipKeyBtn").addEventListener("click", () => {
    document.getElementById("apiModal").classList.remove("open");
  });
  document.getElementById("changeKeyBtn").addEventListener("click", () => {
    document.getElementById("apiKeyInput").value = state.apiKey || "";
    document.getElementById("apiModal").classList.add("open");
  });

  // Session actions
  document.getElementById("exportBtn").addEventListener("click", exportSession);
  document.getElementById("clearBtn").addEventListener("click", () => {
    if (confirm("Clear all chat history?")) {
      state.history = [];
      state.ratings = {};
      state.challenge = null;
      save();
      renderChat();
    }
  });
  document.getElementById("tagBtn").addEventListener("click", promptTag);

  // Send
  document.getElementById("sendBtn").addEventListener("click", send);
  document.getElementById("userInput").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  renderModeTabs();
  renderModeHeader();
  renderHints();
  renderComposer();
  renderExperts();
  renderTags();
  renderChat();
}

init();
