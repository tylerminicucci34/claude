/* ═══════════════════════════════════════════════════════════
   AI BUSINESS BRAIN TRUST v10
   15 experts · 7 modes · 100% offline
═══════════════════════════════════════════════════════════ */

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

/* ── OFFLINE EXPERT ENGINE ──────────────────────────────
   In-character phrase banks per expert. No API, no keys.
   VOICES = default / business-coaching takes
   STOCK_VOICES = stocks / investing / market takes
   BIZ_PICK_VOICES = "what business should I start?" takes
─────────────────────────────────────────────────────────── */

function detectTopic(text) {
  const t = (text || "").toLowerCase();
  const stockWords = /\b(stock|stocks|invest|investing|market|share|shares|portfolio|etf|s&p|nasdaq|dow|bond|bonds|crypto|bitcoin|ethereum|nvda|tsla|aapl|msft|amzn|googl|meta|spy|qqq|ticker|dividend|buy the dip|short|long position|options|calls|puts|gold|silver)\b/;
  const bizPickWords = /\b(what business|start a business|side hustle|which business|what should i start|biz idea|business idea|business to start|what to sell|business opportunity)\b/;
  if (bizPickWords.test(t)) return "biz";
  if (stockWords.test(t)) return "stocks";
  return "default";
}
const VOICES = {
  hormozi: {
    sev: "HIGH",
    diag: "Your offer is the problem, not your traffic. Stack the value: dream outcome, perceived likelihood, divide by time and effort. Until that math beats every alternative, nothing else matters.",
    yes: "If the LTV-to-CAC math works, run it. Speed is the moat.",
    no:  "I have not seen the unit economics. Until CAC, LTV, and gross margin are written on paper, the answer is no.",
    advice: "Look — most people obsess over tactics. Fix the offer first. A grand-slam offer makes everything downstream easier: ads convert, sales close, refunds drop. Write down your dream outcome, your perceived likelihood of success, time delay, and effort/sacrifice. Then make each one 10x better."
  },
  cardone: {
    sev: "CRITICAL",
    diag: "YOUR TARGETS ARE TOO SMALL. 10X them. Whatever you said your goal is, multiply it by 10 right now. The middle class is a TRAP and that is where your thinking lives.",
    yes: "GO. Massive action. 10X EVERYTHING. Do not negotiate with yourself.",
    no:  "That is average thinking. Until you 10X the plan, the answer is no.",
    advice: "Listen. Whatever you think it will take — TEN-X IT. 10X the actions. 10X the calls. 10X the follow-ups. The reason you are stuck is OBSCURITY. Nobody knows you exist. Get out there, be obsessed, dominate your space. Average is the enemy."
  },
  andrewtate: {
    sev: "HIGH",
    diag: "Brother, your speed is too slow. The matrix wants you slow, broke, and conforming. You're moving like a man with options. You don't have options. You have a deadline.",
    yes: "Brother, send it. Speed of implementation. What color is your Bugatti?",
    no:  "G, that is matrix thinking. Slow down. Not for me.",
    advice: "Speed of implementation is everything, G. You think too much and act too little. Pick the income stream — copywriting, e-commerce, content, crypto — and attack it like your life depends on it. Because it does. Most men live like cowards. Be the exception."
  },
  tristantate: {
    sev: "MEDIUM",
    diag: "You are playing checkers in a chess game. You see one move, your competitors see five. Position matters more than effort here.",
    yes: "Calculated. The board favors this move. Yes.",
    no:  "The long game does not reward this. No.",
    advice: "Think like a chess player, not a boxer. You are obsessed with the next punch when you should be obsessed with the next five moves. Leverage, position, optics, networks — these compound. Quiet operators win wars. Loud operators get killed."
  },
  buffett: {
    sev: "MEDIUM",
    diag: "I do not understand the business well enough yet. If you cannot describe it on the back of a napkin, neither can your customer. Stay inside your circle of competence.",
    yes: "If the moat is real and the price is fair, hold for twenty years. Yes.",
    no:  "Rule No. 1: never lose money. I do not see the margin of safety. No.",
    advice: "Charlie and I have a simple rule: be fearful when others are greedy, and greedy when others are fearful. The market is a voting machine in the short run and a weighing machine in the long run. Find a business with a wide moat, run by honest people, at a fair price. Then sit on your hands."
  },
  musk: {
    sev: "CRITICAL",
    diag: "Reason from first principles. The cost of this should be 10x lower. You are using analogy, not physics. Find the constraint and break it.",
    yes: "If the physics work, do it. The best part is no part.",
    no:  "Probability of success is low. Do not do it.",
    advice: "Decompose the problem to physics. What is the actual constraint? Manufacturing? Energy? Capital? Then ask: what would a 10x improvement look like? Not 10 percent — 10 times. If you cannot see that path, you are solving the wrong problem. Delete the requirement before you optimize the part."
  },
  trump: {
    sev: "MEDIUM",
    diag: "Your brand is weak. Tremendous opportunity, terrible execution. Nobody knows who you are. Many people are saying that.",
    yes: "It will be huge. Tremendous. Believe me.",
    no:  "Bad deal. The worst. I would walk away.",
    advice: "Look — you have to win. Winning is everything. Your brand has to be the biggest, the best, the strongest. Never show weakness, never apologize, never give them anything for free. The art of the deal is leverage. If you do not have leverage, walk away. People respect winners, believe me."
  },
  garyv: {
    sev: "HIGH",
    diag: "You are not putting out enough content. You should be on TikTok, Reels, YouTube Shorts, LinkedIn, podcasts — 60 to 80 pieces a day. Attention is the asset, you are sleeping on it.",
    yes: "Macro patience, micro speed. Send it.",
    no:  "Not yet. Build the audience first.",
    advice: "Listen, you have to understand — attention is the asset class of the decade. You should be making 80 pieces of content a day, distributing on every platform, learning what hits and what doesn't. Document, don't create. Jab, jab, jab, right hook. Stop overthinking it. The opportunity is right now."
  },
  belfort: {
    sev: "HIGH",
    diag: "Your tonality is off. The pitch lacks certainty. Three tens are missing: you, the product, the company. Until those are at a ten, you are not closing anything.",
    yes: "Straight line. Close it. Yes.",
    no:  "Bad close. You are leaking certainty. No.",
    advice: "The words are 7 percent. Tonality is 38. Body language is 55. You can have the world's best product and lose the sale on tonality alone. Get the three tens locked: certainty in the product, certainty in you, certainty in the company. Walk the straight line — qualify, pitch, loop the objection, close."
  },
  robbins: {
    sev: "HIGH",
    diag: "Your state is wrong. State drives action, action drives results. You are operating from fear or scarcity, and it is leaking into every decision you make.",
    yes: "Decide. Commit. Resolve. The answer is yes if you change your state.",
    no:  "Not in this state. Change your state first.",
    advice: "Where focus goes, energy flows. Right now, your focus is on what you cannot do. Shift it. Stand up, change your physiology, ask a better question — what if this is happening FOR me, not TO me? Massive action plus a beautiful state equals breakthrough. Decide right now. Commit. Resolve."
  },
  goggins: {
    sev: "CRITICAL",
    diag: "You are soft. You think you have given it your all and you are at maybe 40 percent. The accountability mirror does not lie. Get hard.",
    yes: "Stop talking. Do the work. Yes.",
    no:  "You are not built for it YET. No.",
    advice: "Look in the accountability mirror. Stop telling yourself the lies. You are not tired — you are 40 percent in. Most people quit when their mind tells them it hurts. That is exactly when growth starts. Stay hard. Who's gonna carry the boats? You are."
  },
  martell: {
    sev: "MEDIUM",
    diag: "You are doing every dollar-an-hour task in your business yourself. The replacement ladder is broken. Use the buyback principle: delegate the lowest-value tasks first.",
    yes: "Use the 1-3-1 framework. One problem, three options, one recommendation. Yes.",
    no:  "Not without a system. No.",
    advice: "The buyback principle: track your time for one week, find the lowest-dollar tasks, delegate them first. Your job as a founder is to remove yourself from the work, not become the bottleneck. Systems first, then hiring. Use the 1-3-1 framework on every decision: one problem, three options, one recommendation."
  },
  andyelliott: {
    sev: "CRITICAL",
    diag: "BROTHER. Your energy is at a 3. You need to be at a 10. Every call, every pitch, every interaction. If you are not the highest energy in the room, you are losing.",
    yes: "Brother. SEND IT. Max energy. YES.",
    no:  "Brother, you are not ready. Train harder.",
    advice: "Brother, listen to me. Energy is everything. Confidence is everything. The reason you are losing is your identity. Champions train every single day — scripts, rebuttals, role play. You think it is about technique? It is about IDENTITY. Decide today: you are the best."
  },
  kiyosaki: {
    sev: "HIGH",
    diag: "You are buying liabilities and calling them assets. Your house is not an asset. Your car is not an asset. An asset puts money in your pocket. Period.",
    yes: "If it cashflows, yes. Rich Dad would say so.",
    no:  "Rich Dad would say the savers are losers. No.",
    advice: "Most people are trapped in the E and S quadrants — employee and self-employed. You want to move to B and I — business owner and investor. Cash-flowing assets, not paychecks. Real estate, businesses, paper assets — anything that pays you while you sleep. The rich do not work for money. They make money work for them."
  },
  rogan: {
    sev: "MEDIUM",
    diag: "It is entirely possible you are missing something. Have you ever talked to someone who has done this at the highest level? That is wild that you would skip that.",
    yes: "I mean — it is entirely possible this works. Yeah, I would try it.",
    no:  "It is wild that we are even considering this. No.",
    advice: "Have you ever talked to someone who has done this at a top level? Like, really sat down with them? That is the move. Stay curious. Try things. Push back on what everyone is telling you is true. Most conventional wisdom is just stuff people repeat. Test it yourself."
  }
};

const STOCK_VOICES = {
  hormozi: { sev:"MEDIUM", diag:"Stocks are not a business. You are buying a piece of someone else's compounding. If you want real returns, build your own offer — the multiple is yours, not the market's.", yes:"If it cashflows and beats your CAC payback, yes. Otherwise build the business.", no:"Stocks are not where wealth is created — they store it. Build first.", advice:"Look — stocks are a savings account with volatility. Real wealth comes from owning the offer, the customer relationship, the operating leverage. Buy a basket of cashflow-producing index funds for storage, then build a business that prints money. That is the play." },
  cardone: { sev:"HIGH", diag:"STOCKS WILL NOT MAKE YOU RICH. You need cash flow. You need real estate. The market is a SLOW LANE. Get in the FAST LANE.", yes:"10X positions only. Massive action.", no:"Stocks are middle-class thinking. NO.", advice:"Listen — the stock market is for storing money, NOT making it. Buy CASHFLOWING REAL ESTATE. Apartments. Multifamily. That is how the rich get richer. A 401k is a 40-year LOSER plan. 10X your income FIRST, then buy assets that cashflow MONTHLY." },
  andrewtate: { sev:"MEDIUM", diag:"Brother, the stock market is rigged. The whales know before you do. You are playing their game in their casino.", yes:"Crypto, gold, real estate — yes. Stocks? Slow.", no:"Matrix paper. No.", advice:"G, the matrix wants you in their stock market because they print the money and inflate the asset. Stack BTC, stack physical gold, build an income stream that pays in cash. Speed is everything. While you are waiting for Tesla to go up 8 percent, I made 50K on a copywriting client." },
  tristantate: { sev:"MEDIUM", diag:"You are buying into a position with no leverage. Retail traders are the exit liquidity for someone else's plan. Know your role.", yes:"If it serves a long-term strategic position — yes.", no:"Tactical retail trading is for losers. No.", advice:"The stock market rewards patience and information asymmetry. Retail has neither. Either build a 20-year index position and forget it, or get out of the casino entirely and put capital into businesses you control. Position, not prediction." },
  buffett: { sev:"LOW", diag:"Most investors lose by trying to be clever. Buy a low-cost S&P 500 index fund. Hold it for fifty years. Charlie agrees.", yes:"If the moat is wide and the price is fair, yes. Hold forever.", no:"I cannot value it. No.", advice:"Be fearful when others are greedy, and greedy when others are fearful. For 95 percent of people, the right answer is a low-cost S&P 500 index fund, bought monthly, held for decades. If you must pick stocks, stay inside your circle of competence, demand a margin of safety, and never bet more than you can afford to lose. Rule No. 1: never lose money." },
  musk: { sev:"MEDIUM", diag:"Most stock picking is gambling with extra steps. Index funds are the rational default unless you have informational edge.", yes:"If the technology compounds at 10x, yes. Long.", no:"Probability of being right is too low. No.", advice:"From first principles: most active traders underperform an index. Unless you have an informational edge, buy the index. If you want to pick individual companies, pick the ones building technology with exponential improvements — energy, AI, automation. Time horizon: ten plus years. Anything shorter is noise." },
  trump: { sev:"MEDIUM", diag:"The market is HUGE. Tremendous. But you need to buy WINNERS. Losers stay losers. Believe me.", yes:"Big winner. Tremendous. Yes.", no:"Total loser. Walk away.", advice:"Look — the stock market is the greatest casino in the world, and I have made tremendous deals there. But you have to back winners. American companies. American jobs. Buy the strong brands — the dominant names. And real estate — always real estate. They are not making any more land, believe me." },
  garyv: { sev:"MEDIUM", diag:"You are putting money into Apple instead of building YOUR brand. Your attention is the asset. Bet on yourself.", yes:"If you understand the business — yes.", no:"You don't even use the product. No.", advice:"Listen, I am long stocks I personally use and believe in for decades — Apple, Twitter at the time, brands I love. But the BEST investment for most people in their 20s and 30s is yourself. Your skills. Your audience. Your distribution. Buy index funds for the long game, then put your real energy into building your personal brand. That compounds 100x faster." },
  belfort: { sev:"HIGH", diag:"Retail traders lose because they have no system. They chase, they panic, they sell at the bottom. Get a system or get out.", yes:"With a system and discipline — yes.", no:"You are emotional. You will lose. No.", advice:"Look — I sold penny stocks. I know how this game works. Most retail traders are emotional, undisciplined, and serve as exit liquidity for the pros. If you are going to trade, get a system. Define entry, exit, risk per trade, and follow it like a religion. Better yet, index and chill, and put your energy into sales — which actually has a closing rate you can control." },
  robbins: { sev:"LOW", diag:"Most retail investors lose because of state. Fear sells the bottom, greed buys the top. Master your psychology first.", yes:"With the right strategy, yes.", no:"Not in this emotional state. No.", advice:"I wrote MONEY: Master The Game with Ray Dalio and Jack Bogle — and the consensus from every one of them is the same: low-cost index funds, dollar-cost average, asset allocation, never panic sell. The All-Weather portfolio handles every economic season. Master your emotions, automate the investing, and focus your time on producing — not predicting." },
  goggins: { sev:"MEDIUM", diag:"You are looking for an easy way out. There isn't one. Stock picking is a shortcut and shortcuts make you soft.", yes:"If you accept you might lose it all — yes.", no:"You want the gain without the work. No.", advice:"The stock market is not your savior. Doing the hard work — that is your savior. Stack the index funds, automate it, and stop checking your portfolio every five minutes. Your job is to callus your mind and make so much income that the market is irrelevant. Stay hard." },
  martell: { sev:"LOW", diag:"You are trading time for stock charts instead of building systems that compound. Wrong leverage point.", yes:"Index it, automate it, ignore it. Yes.", no:"Active trading is the opposite of buyback. No.", advice:"The buyback principle applies to investing too: automate it so it does not consume your attention. Set a monthly auto-buy into a broad index fund, ignore the news, and put your active hours into building your business. Most founders I coach who beat the market did it by 10x-ing their business income — not by picking stocks." },
  andyelliott: { sev:"MEDIUM", diag:"BROTHER. Stocks are not going to change your life. SALES will. Your sales skill compounds 100x faster than NVDA.", yes:"If you have stable income and zero debt — yes.", no:"Your sales game is not at a 10 yet. Get there first. NO.", advice:"BROTHER, listen to me — your income is your fastest asset. You make 200K a year as a closer, you can buy any stock you want. You make 50K trying to pick stocks, you stay broke. Bet on yourself. Train every day. Become so dangerous in sales that money flows to you. THEN park it in index funds and let it compound." },
  kiyosaki: { sev:"HIGH", diag:"The stock market is a paper asset. The rich don't trust paper — they own real estate, businesses, and precious metals. WAKE UP.", yes:"If it is a cashflow asset — yes.", no:"Paper. Fake. No.", advice:"Stocks are paper assets — controlled by Wall Street, taxed at every turn, inflated by the Fed. Rich Dad would say: own assets you can touch. Real estate that cashflows. Businesses that produce. Silver and gold that the government cannot print. The stock market is for retail. The B and I quadrant build real wealth." },
  rogan: { sev:"MEDIUM", diag:"It is wild how confident people are about stocks they don't understand. Have you ever talked to a real fund manager? It humbles you.", yes:"I mean, sure — if you believe in the company. Yeah.", no:"That's wild. No.", advice:"Look, I am not a financial guy. But the smartest investors I have had on the podcast — Ray Dalio, Cliff Asness — they all say the same thing. Diversify. Index funds. Long time horizon. Do not try to time it. And honestly? Take a fraction and bet on yourself, your skill, your business. That is the real edge." }
};

const BIZ_PICK_VOICES = {
  hormozi: { sev:"HIGH", diag:"You are picking a business before you have picked a customer. Pick a starving crowd first, then build the offer they cannot refuse.", yes:"If the market is hungry and you can deliver — yes.", no:"No starving crowd. No.", advice:"Pick a business with these four traits: starving crowd, high pain, willing to pay, easy to reach. Service businesses for small businesses (cleaning, lawn care, agencies for local biz) are the fastest path to your first 100K. Build a grand-slam offer, run hand-raise ads, close on the phone. You can hit 30K a month in six months if you do not get clever." },
  cardone: { sev:"CRITICAL", diag:"You are still THINKING about what business. STOP. Get into SALES first. Then real estate. That is the path.", yes:"Sales + real estate. YES.", no:"You are still researching. NO.", advice:"Listen — the BEST business for you right now is SALES. Get a high-ticket commission job. Close everything that moves. Make 200K a year as a closer. THEN take that money and buy multifamily real estate. Apartments. Cashflow. Tenant pays the mortgage. THAT is how you become rich. 10X EVERYTHING." },
  andrewtate: { sev:"HIGH", diag:"You are slow. While you research, brothers are stacking. Pick one — copywriting, e-commerce, content creation, crypto. GO.", yes:"Pick today. Move tomorrow. YES.", no:"You are still talking. NO.", advice:"G, here are the income streams: copywriting (sell a service in 30 days), e-com (drop ship, white label), content (build an audience, sell to it), crypto (study, invest). Pick ONE this week. Don't pivot for 90 days. Speed is everything, brother. The matrix wants you researching forever. Escape now." },
  tristantate: { sev:"MEDIUM", diag:"You are choosing tactics before strategy. Decide your endgame — wealth? power? freedom? — then pick the business that compounds toward it.", yes:"If it builds toward your endgame — yes.", no:"It is a distraction. No.", advice:"Think in five-year arcs. The best businesses for a new operator: agency services (high margin, no inventory), licensing (you own the IP), and acquisition (buy small profitable businesses with seller financing). Pick the one that compounds your network and reputation, because those become your real assets at scale." },
  buffett: { sev:"MEDIUM", diag:"Pick a business inside your circle of competence. Most people fail because they chase what is hot instead of what they understand.", yes:"If you understand it and the moat is real — yes.", no:"You do not understand it. No.", advice:"Charlie and I would say: pick a business you understand. A laundromat. A car wash. A neighborhood service business. The boring ones with predictable cash flow, repeat customers, and a moat — even a small local one — beat the next shiny thing. Buy or build it for cash flow, reinvest the profits, and hold it for decades." },
  musk: { sev:"MEDIUM", diag:"Most business ideas are derivative. Pick a problem important to the future of civilization. The best companies solve real physics-level problems.", yes:"If it improves the future at 10x — yes.", no:"Too small. No.", advice:"From first principles: the best businesses solve genuinely hard problems with massive markets. Energy, transportation, AI, biotech, manufacturing — these are where the leverage is. If you are starting today and want to maximize impact, build software in a vertical where the incumbent is sleepy. Or solve a hardware problem nobody has touched in 30 years. Pick something that is hard." },
  trump: { sev:"MEDIUM", diag:"You are thinking small. Tremendous opportunities are everywhere — real estate, branding, licensing your name. Think BIG.", yes:"Tremendous deal. Yes.", no:"Small deal. Pass.", advice:"Look — the best business is the one where YOUR NAME goes on it. Real estate. Licensing. Branding. You build the brand, then you put it on everything — buildings, hotels, ties, water. Leverage is everything. Find a great location, get the financing, slap your name on it, win. People love a winner. Believe me." },
  garyv: { sev:"HIGH", diag:"You are picking a business without picking a platform. Where do your customers live? Pick the platform first, then build the business.", yes:"If you can dominate the platform — yes.", no:"No distribution edge. No.", advice:"In 2025, the best business is one with a content-driven distribution engine. Agency for local businesses, e-commerce DTC brand, info products, services — they all win when you have organic distribution. Start a TikTok or YouTube channel TODAY for the niche you want to serve. Build the audience FIRST. Then layer the business on top. Macro patience, micro speed." },
  belfort: { sev:"HIGH", diag:"Pick a business where you can sell something high-margin on the phone. Sales is the leverage point. Without it, nothing works.", yes:"If the close rate is real — yes.", no:"No phone sales motion. No.", advice:"The best businesses are ones with a tight phone sales motion. Coaching, agencies, financial advice, B2B services — anything with a sales call. Build a list, run ads, book calls, close 30 percent of qualified leads. That is the cleanest path from zero to seven figures. If you can sell on the phone, the business almost picks itself." },
  robbins: { sev:"MEDIUM", diag:"You are looking for the perfect business. There is no perfect business. There is only the one you commit to. Decide.", yes:"With commitment — yes.", no:"You are not committed. No.", advice:"The right business is the one aligned with your strengths, your story, and your soul. Ask: what do people already pay me for? What am I obsessed with? Who do I want to serve? The intersection of those three is your business. Decide today. Commit. Resolve. Take massive action — and adjust as you go. The market gives feedback you cannot get from planning." },
  goggins: { sev:"MEDIUM", diag:"You are looking for the easy business. There isn't one. Pick the one nobody wants — and outwork everyone.", yes:"If you accept it will be hard — yes.", no:"You want easy. No.", advice:"The best business for you is the one nobody else wants to do. Manual labor businesses. Service businesses. Junk removal. Power washing. Real estate cleanups. Boring, hard, profitable. You do not need an idea — you need the will to outwork the soft people in those industries. Get up at 4am. Stay hard. Build it brick by brick." },
  martell: { sev:"MEDIUM", diag:"Pick a SaaS or productized service. Recurring revenue plus systems equals a sellable asset. Anything else is a job.", yes:"If it has recurring revenue — yes.", no:"One-time revenue is a job. No.", advice:"Three businesses with the highest leverage today: 1) a productized service (one offer, one price, one delivery process), 2) a niche SaaS (vertical, painful problem, monthly), 3) a content-led education business (course + community). All three scale with systems, not your time. Pick the one closest to a skill you already have. The 1-3-1 rule applies — three options, pick one, commit." },
  andyelliott: { sev:"HIGH", diag:"BROTHER. The best business is one where your INCOME is uncapped. Commission sales. Period.", yes:"Sales role. YES.", no:"Salary cap. NO.", advice:"BROTHER, the best business in America is COMMISSION SALES. Car sales, solar sales, roofing sales, high-ticket coaching closer — uncapped income. You go in, you become the BEST in your dealership, the BEST in your market, and you make 300K, 500K, a million. Then once you've mastered sales, you OWN the dealership, the agency, the company. Sales first. Always." },
  kiyosaki: { sev:"HIGH", diag:"Don't pick a business that owns you. Pick one that builds toward the B and I quadrant — systems and investments, not your labor.", yes:"If you can leave and it still runs — yes.", no:"It is just a job in disguise. No.", advice:"The wrong business is one where YOU are the asset. The right business is one with systems, employees, and a brand that operates without you. Real estate is the king — rental properties, syndications, commercial. Network marketing teaches you sales for cheap. Vending, laundromats, ATM routes, storage units — boring, cashflowing, mostly hands-off. Move toward B and I." },
  rogan: { sev:"MEDIUM", diag:"It is wild how many people pick a business they don't actually like. You will hate it in two years. Pick something you would do for free.", yes:"If you'd do it for free — yes.", no:"You'd quit in a year. No.", advice:"Honestly? Pick a business around something you are genuinely obsessed with. I started a podcast because I loved talking. Joe Schmoe started a BBQ company because he loved BBQ. The grind is brutal — the only fuel that lasts is curiosity and obsession. Look at what you do for free. Make a business around it. Money follows passion, not the other way around — most of the time." }
};

function pickVoice(expertId, topic) {
  if (topic === "stocks" && STOCK_VOICES[expertId]) return STOCK_VOICES[expertId];
  if (topic === "biz" && BIZ_PICK_VOICES[expertId]) return BIZ_PICK_VOICES[expertId];
  return VOICES[expertId];
}

async function generateResponse(kind, userText, expert) {
  await new Promise(r => setTimeout(r, 350));
  const topic = detectTopic(userText);
  if (kind === "hotseat") {
    return JSON.stringify(EXPERTS.map(e => {
      const v = pickVoice(e.id, topic);
      return { expert: e.id, severity: v.sev, diagnosis: v.diag };
    }));
  }
  if (kind === "decision") {
    return JSON.stringify({
      votes: EXPERTS.map((e, i) => {
        const v = pickVoice(e.id, topic);
        const yes = i % 5 < 3;
        return { expert: e.id, vote: yes ? "YES" : "NO", reason: yes ? v.yes : v.no };
      })
    });
  }
  if (kind === "mixtape") {
    return JSON.stringify(EXPERTS.map(e => ({
      expert: e.id,
      text: pickVoice(e.id, topic).advice
    })));
  }
  if (kind === "challenge") {
    const v = pickVoice(expert.id, topic);
    const tasks = challengeTasksFor(expert.id);
    const days = [];
    for (let i = 1; i <= 30; i++) days.push({ day: i, task: tasks[(i - 1) % tasks.length] });
    return JSON.stringify({
      expert: expert.id,
      goal: userText,
      intro: v.advice,
      days
    });
  }
  if (kind === "script") {
    return scriptFor(expert, userText);
  }
  if (kind === "reversal") {
    return reversalFor(expert, userText);
  }
  if (kind === "tracker") {
    return pickVoice(expert.id, topic).advice;
  }
  return pickVoice(expert.id, topic).advice;
}

function challengeTasksFor(id) {
  const banks = {
    hormozi: ["Rewrite your offer using the value equation", "Define your dream outcome in one sentence", "Calculate CAC and LTV today", "Send 25 outbound DMs with new offer", "Cut one offer that does not 10x results", "Talk to 3 customers, document their words", "Test new offer on 10 leads", "Track gross margin per sale", "Eliminate one effort/sacrifice from offer", "Build the lead magnet → tripwire → core path"],
    cardone: ["Make 100 cold calls today", "10X your daily revenue target NOW", "Send 50 follow-ups before lunch", "Post 10 pieces of content today", "Stop watching the news for 30 days", "Drive past your dream property", "Wake up at 4am, no excuses", "Read 30 pages of a sales book", "Set 5 meetings this week", "OBSESS over the goal, no balance"],
    andrewtate: ["No social media until your work is done", "Train your body for 60 minutes", "DM 30 prospects today, G", "Build one income stream this week", "Read for 30 minutes, no excuses", "Cut one matrix consumption habit", "Reach out to a man who is winning", "Cold shower, every morning, no negotiation", "Document your daily wins publicly", "Speed is the only virtue today"],
    tristantate: ["Map your network — who has leverage?", "Read Sun Tzu chapter 1 today", "Identify the 3 biggest threats to your position", "Build one new strategic alliance this week", "Audit your optics — what do people see?", "Plan five moves ahead in your industry", "Eliminate one unnecessary obligation", "Study one geopolitical event for an hour", "Send one strategic favor to a heavy hitter", "Stay quiet about your next move"],
    buffett: ["Read for 5 hours today", "Define your circle of competence in writing", "Find one business with a 10-year moat", "Calculate margin of safety on one position", "Cut one liability from your balance sheet", "Write a 1-page thesis for one investment", "Wait. Patience is a position.", "Re-read a Berkshire shareholder letter", "Find one mistake you made — write it down", "Eat a hamburger, drink a Cherry Coke, think long-term"],
    musk: ["Identify the actual physical constraint", "Delete one requirement from your project", "Reduce one part count by 50%", "Run the math from first principles, ignore convention", "Hire one engineer this week", "Sleep on the factory floor for one shift", "Set a deadline 50% sooner than reasonable", "Question every meeting on your calendar", "Build a 10x version, not a 10% version", "If you are not embarrassed by v1, you shipped late"],
    trump: ["Make a tremendous deal today", "Brand yourself bigger, louder, better", "Negotiate one rate down by 20%", "Send one bold press release about you", "Hire only the best people, fire the rest", "Build your tower — your signature thing", "Never apologize for winning", "Find one enemy, beat them publicly", "Add your name to one major asset", "Always punch back twice as hard"],
    garyv: ["Post 10 pieces of content today", "Study one platform analytics deep dive", "Record one podcast or long-form video", "DM 50 followers, no pitch, real talk", "Document, do not create — film your day", "Test one new format this week", "Comment 100 times on your niche today", "Look at TikTok trends for 20 min", "Hire a video editor or cut a clip yourself", "Macro patience, micro speed — ship today"],
    belfort: ["Practice your pitch out loud for 30 minutes", "Get certainty to a 10 on you, product, company", "Make 50 dials today", "Loop one objection in writing", "Record yourself selling, listen back", "Train your tonality — read aloud for 20 min", "Walk the straight line on 10 calls", "Qualify harder up front", "Lock in your opening 30 seconds", "Close with confidence, ask for the order"],
    robbins: ["Change your physiology — 10 min movement", "Write down 3 incantations and say them out loud", "Decide one big thing today and commit", "Ask a better question 5 times today", "Get 1% better at one skill", "Cold plunge — change your state physically", "Read one chapter of a growth book", "Help one person without expecting return", "Identify your dominant emotion, shift it", "Live in a beautiful state — choose it"],
    goggins: ["Run 4 miles before sunrise", "Look in the accountability mirror", "Do 100 push-ups, even if you don't want to", "Skip one comfort today, deliberately", "Train when no one is watching", "Read one chapter of Can't Hurt Me", "Stay hard — no complaints today", "Get to 40% — then push to 100%", "Cold shower, 5 minutes, no escape", "Carry the boats"],
    martell: ["Track your time in 15-min blocks today", "Identify your lowest-dollar tasks", "Delegate or eliminate one task today", "Run one decision through 1-3-1 framework", "Document one SOP for your team", "Hire your first assistant or upgrade them", "Audit your replacement ladder", "Set up one automation today", "Schedule one buyback meeting with team", "Spend 90 min in your zone of genius"],
    andyelliott: ["Train 1 hour on scripts before work, brother", "Make 50 calls at MAX energy", "Role play 10 rebuttals out loud", "Record your pitch, watch it back, tear it apart", "Hit the gym before sales floor", "Walk in with the highest energy in the room", "Memorize one new closing line", "Help one teammate close a deal", "Read a sales book for 30 minutes", "Decide: you are the best in your market today"],
    kiyosaki: ["Read Rich Dad Poor Dad chapter 1", "List your assets vs liabilities honestly", "Find one cash-flowing investment", "Talk to one person in the B or I quadrant", "Buy silver or gold today", "Cut one liability from your life", "Study one real estate deal", "Build one passive income stream", "Stop saving — start investing in assets", "Reread the CASHFLOW quadrant chapter"],
    rogan: ["Try jiu-jitsu or a martial art class", "Sit in a sauna for 20 minutes", "Talk to someone outside your bubble", "Read a book you would never normally pick", "Take a long walk, no phone, just think", "Listen to one podcast outside your niche", "Try cold plunging — even just a cold shower", "Question one belief you take for granted", "Eat clean for one day, see how you feel", "Stay curious — ask three weird questions today"]
  };
  return banks[id];
}

function scriptFor(expert, brief) {
  const t = (brief || "your offer").trim();
  const lines = {
    hormozi: "Subject: I can probably double your booked calls\n\nHey [name],\n\nQuick math: if you added 30 booked calls per month at your current close rate, that is roughly $X in new revenue. I help [niche] do exactly that without spending more on ads.\n\nI will show you the offer audit on a 15-min call. No pitch, just the math.\n\nWorth a look?\n\n— [you]",
    cardone: "BIG IDEA: " + t + "\n\nWe are 10X-ING this. Not 10 percent better. 10 TIMES bigger. Your competitors are playing small. We are going to OBLITERATE them.\n\nMassive action. Daily output. Obsession over balance. This is how empires are built.\n\nLet's GO. 10X EVERYTHING.",
    andrewtate: "Brother, listen.\n\nMost men will read this and do nothing. They will scroll, cope, and stay broke. You are different.\n\n" + t + "\n\nWhat color is your Bugatti? Mine is black. Get to work, G.",
    tristantate: "Strategic memo: " + t + "\n\nThe opportunity is positional. Three moves ahead, our competitors will be defending — we will already be three moves further.\n\nQuiet execution. Calculated risk. Loyalty rewarded. This is how dynasties last.",
    buffett: "Dear shareholder,\n\nCharlie and I have looked at " + t + ". The business has the qualities we admire: a durable moat, honest management, and a price below intrinsic value.\n\nWe plan to hold for the next twenty years. The market will be wrong before then. We will be patient.\n\nRule No. 1: never lose money. Rule No. 2: never forget Rule No. 1.",
    musk: "Tweet: " + t + " — first principles math says cost should be 10x lower. Will fix.\n\nReply 1: Most engineers optimize the part. Best engineers delete the part.\n\nReply 2: If schedule is realistic, you are late.\n\nReply 3: This is just physics. The constraint is X. Solve X.",
    trump: t + " is going to be TREMENDOUS. The best. Nobody does it better than us. Believe me.\n\nMany people are saying this is the greatest opportunity they have ever seen. And they are right.\n\nWe will WIN. We will win SO MUCH. You will get tired of winning.",
    garyv: "Hook: nobody is talking about this and it is the biggest opportunity in [niche] right now.\n\nMiddle: " + t + ". Document, don't create. Macro patience, micro speed.\n\nCTA: comment 'yes' if you are doing this and I will follow up.",
    belfort: "Hey [prospect], it's [name] with [company], how are you today?\n\nGreat. Look, the reason for the call: " + t + ". I am only going to take 60 seconds.\n\n[pitch with certainty in tonality]\n\nDoes that sound like something that would be of interest, based on what you know so far?\n\n[loop on objection, close on the third try]",
    robbins: "Take a deep breath. Stand up. Feel your feet on the ground.\n\nNow ask yourself: what if " + t + " is happening FOR me, not TO me?\n\nDecide right now. Commit. Resolve. Where focus goes, energy flows. Take massive action TODAY. Not tomorrow. Today.",
    goggins: "Listen. " + t + ".\n\nNobody is coming. No cavalry. Just you and the accountability mirror.\n\nYou think you have given it everything? You are at 40 percent. Stay hard. Who is gonna carry the boats? YOU ARE.",
    martell: "Quick framework on " + t + ":\n\n1. Track time in 15-min blocks for one week.\n2. Find your lowest-dollar tasks (under $50/hr).\n3. Delegate or eliminate the bottom 20%.\n4. Use the 1-3-1: one problem, three options, one recommendation.\n5. Repeat quarterly.\n\nBuyback principle. Systems first.",
    andyelliott: "BROTHER. " + t + ".\n\nYou want to be the best? Train every single day. Scripts. Rebuttals. Role play. Energy at a 10 from the moment you walk in.\n\nMax confidence. Max energy. Max output. DECIDE TODAY: you are the best in your market.",
    kiyosaki: "Rich Dad would say " + t + " sounds like a liability disguised as an asset.\n\nAn asset puts money in your pocket. Period. If it costs you money, it is a liability.\n\nMove from the E quadrant to the B and I quadrant. Stop trading time for money. Make money work for you.",
    rogan: "So... " + t + ". That is wild. Have you ever talked to someone who has actually done this at the highest level? Like, sat down with them for three hours?\n\nIt is entirely possible you are missing something obvious. Or — and this is what is wild — it might be even bigger than you think. Look into it."
  };
  return lines[expert.id] || VOICES[expert.id].advice;
}

function reversalFor(expert, context) {
  const c = (context || "your situation").trim();
  const blocks = {
    hormozi: "1. What is your dream outcome — in one sentence?\n2. What is your current CAC and LTV? Show me the math.\n3. What is your gross margin per sale?\n4. Why would someone pay you over the next best alternative?\n5. What is the time delay between purchase and result?\n6. What effort or sacrifice is your customer making?\n7. If you 10x'd your offer tomorrow, what would it look like?",
    cardone: "1. WHY IS YOUR GOAL SO SMALL?\n2. What would 10X look like — say it out loud.\n3. How many calls did you make today? Not yesterday — TODAY.\n4. Who is your competition and why are they beating you?\n5. What are you obsessed with right now?\n6. Where are you being average?\n7. What would you do if failure was illegal?",
    andrewtate: "1. Brother, what color is your Bugatti?\n2. Are you faster than your competition? Be honest.\n3. What income stream are you building right now?\n4. How many hours are you wasting on the matrix daily?\n5. Are you in the best shape of your life?\n6. Who are the men around you and are they winning?\n7. What is your excuse — and is it valid?",
    tristantate: "1. What is your five-year position?\n2. Who has leverage over you that you do not see?\n3. What is your opponent's next move?\n4. Where are you loud when you should be quiet?\n5. Whose loyalty have you earned this year?\n6. What is your exit if this fails?\n7. Are you playing chess or checkers?",
    buffett: "1. Can you describe this business on a napkin?\n2. What is the moat — and will it last 20 years?\n3. Is the management honest and competent?\n4. What is your margin of safety on price?\n5. Are you inside your circle of competence here?\n6. What would Charlie say about this?\n7. Would you be happy if the market closed for 10 years after you bought?",
    musk: "1. What is the actual physical constraint here?\n2. What requirement can you delete entirely?\n3. What would a 10x improvement look like?\n4. Are you using analogy or first principles?\n5. What is the cost — and why is it so high?\n6. What is the deadline — and is it 50% too far out?\n7. Is this likely to fail? If yes, do it anyway.",
    trump: "1. Is this going to be tremendous? Honestly.\n2. Are you the biggest? The best? Why not?\n3. Who is your enemy and how do you beat them?\n4. What is your brand — in three words?\n5. Where is your leverage?\n6. Are you showing weakness anywhere?\n7. If you walked away right now, would they come back?",
    garyv: "1. How many pieces of content did you publish this week?\n2. What platform are you sleeping on?\n3. Who are you serving — really?\n4. Are you patient on the macro and impatient on the micro?\n5. What is your distribution edge?\n6. Are you documenting or creating?\n7. Did you talk to 50 followers today?",
    belfort: "1. Are you a 10 on certainty — in yourself, the product, and the company?\n2. What is your opening 30 seconds?\n3. How are you handling the price objection?\n4. Are your tonality patterns deliberate?\n5. Are you walking the straight line or wandering?\n6. How many dials are you making per day?\n7. Are you asking for the order?",
    robbins: "1. What state are you in right now? Be specific.\n2. What if this is happening FOR you, not TO you?\n3. What is the empowering meaning here?\n4. What is the disempowering question you keep asking?\n5. Where is your focus going right now?\n6. What decision can you make in the next 60 seconds?\n7. What does the new identity look like?",
    goggins: "1. What lie have you been telling yourself today?\n2. Look in the accountability mirror — what do you see?\n3. Are you at 40% or 100%?\n4. What suffering are you avoiding?\n5. Who is gonna carry the boats?\n6. What is your callus — and how are you building it?\n7. What did you do when no one was watching?",
    martell: "1. Where is your time leaking? Show me the data.\n2. What is the lowest-dollar task you still do?\n3. What is your next hire — and have you written the role?\n4. Run this decision through 1-3-1 with me.\n5. What system is missing right now?\n6. What does your replacement ladder look like?\n7. Where is your zone of genius — and how many hours did you spend there this week?",
    andyelliott: "1. BROTHER — what is your energy at right now?\n2. How many scripts did you train on today?\n3. Are you the highest energy in your office?\n4. What is your identity — say it out loud?\n5. How many rebuttals do you know cold?\n6. Did you train BEFORE the sales floor today?\n7. Are you decided — that you are the BEST?",
    kiyosaki: "1. List your assets — the real ones that cash flow.\n2. What liabilities are you calling assets?\n3. What quadrant are you in: E, S, B, or I?\n4. What asset would you buy with your next $1,000?\n5. What financial education have you invested in this month?\n6. Who is your Rich Dad?\n7. Are you working for money or making money work for you?",
    rogan: "1. Have you ever talked to someone who has actually done this?\n2. What if you are completely wrong about your assumptions?\n3. Have you tried jiu-jitsu? Just kidding — kind of.\n4. What is the wildest version of this idea?\n5. What does your gut say — really?\n6. Have you slept on it?\n7. Is there an expert nobody is listening to?"
  };
  return "Context heard: \"" + c + "\"\n\n" + (blocks[expert.id] || "1. What is your real goal?\n2. What are you avoiding?");
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
    <button id="clearChatBtn" class="clear-chat-btn" title="Clear all chat history">🗑️ Clear</button>
  `;
  document.getElementById("clearChatBtn").addEventListener("click", clearChat);
}

function clearChat() {
  if (confirm("Clear all chat history?")) {
    state.history = [];
    state.ratings = {};
    state.challenge = null;
    save();
    renderChat();
  }
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
  document.getElementById("tagBtn").innerHTML = "🏷️ " + esc(state.currentTag);
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
function draftKey() { return "brainTrustDraft:" + state.mode; }

function switchMode(modeId) {
  const input = document.getElementById("userInput");
  if (input) localStorage.setItem(draftKey(), input.value);
  state.mode = modeId;
  state.activeTag = null;
  renderModeTabs();
  renderModeHeader();
  renderHints();
  renderComposer();
  renderTags();
  renderChat();
  if (input) input.value = localStorage.getItem(draftKey()) || "";
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
  localStorage.removeItem(draftKey());

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
  const raw = await generateResponse("hotseat", situation);
  return { id: "h" + Date.now(), role: "ai", mode: "hotseat", data: parseJSON(raw) || [], tag: state.currentTag, ts: Date.now() };
}

async function runDecision(question) {
  const raw = await generateResponse("decision", question);
  return { id: "d" + Date.now(), role: "ai", mode: "decision", data: parseJSON(raw) || { votes: [] }, tag: state.currentTag, ts: Date.now() };
}

async function runMixtape(question) {
  const raw = await generateResponse("mixtape", question);
  return { id: "m" + Date.now(), role: "ai", mode: "mixtape", data: parseJSON(raw) || [], tag: state.currentTag, ts: Date.now() };
}

async function runScript(brief) {
  const exp = expertById(state.selectedExpert);
  const raw = await generateResponse("script", brief, exp);
  return { id: "s" + Date.now(), role: "ai", mode: "script", expertId: exp.id, text: raw, tag: state.currentTag, ts: Date.now() };
}

async function runReversal(context) {
  const exp = expertById(state.selectedExpert);
  const raw = await generateResponse("reversal", context, exp);
  return { id: "r" + Date.now(), role: "ai", mode: "reversal", expertId: exp.id, text: raw, tag: state.currentTag, ts: Date.now() };
}

async function runChallenge(goal) {
  const exp = expertById(state.selectedExpert);
  const raw = await generateResponse("challenge", goal, exp);
  return { id: "c" + Date.now(), role: "ai", mode: "challenge", data: parseJSON(raw) || { expert: exp.id, days: [] }, tag: state.currentTag, ts: Date.now() };
}

async function runTracker(update) {
  const exp = expertById(state.selectedExpert);
  const raw = await generateResponse("tracker", update, exp);
  return { id: "t" + Date.now(),
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
  // Session actions
  document.getElementById("exportBtn").addEventListener("click", exportSession);
  document.getElementById("clearBtn").addEventListener("click", clearChat);
  document.getElementById("tagBtn").addEventListener("click", promptTag);

  // Send
  document.getElementById("sendBtn").addEventListener("click", send);
  const input = document.getElementById("userInput");
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  // Draft memory — restore and persist across reloads, per mode
  input.value = localStorage.getItem(draftKey()) || "";
  input.addEventListener("input", () => localStorage.setItem(draftKey(), input.value));

  renderModeTabs();
  renderModeHeader();
  renderHints();
  renderComposer();
  renderExperts();
  renderTags();
  renderChat();
}

init();
