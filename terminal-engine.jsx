// Terminal engine — command registry, history, audio, typewriter

const COMMANDS = {
  help: {
    desc: "list all available commands",
    run: () => [
      { type: "section", text: "// AVAILABLE COMMANDS" },
      { type: "catlist", categories: [
        { title: "INFO", items: [
          ["about",      "who is leon pupier"],
          ["whoami",     "current session info"],
          ["skills",     "tech stack & tools"],
          ["experience", "professional history"],
          ["education",  "academic background"],
          ["now",        "what i'm working on"],
          ["contact",    "reach me / socials"],
        ]},
        { title: "SYSTEM", items: [
          ["ls",         "list site sections"],
          ["date",       "current system date"],
          ["uname",      "system info"],
          ["banner",     "redraw ascii banner"],
          ["history",    "command history"],
          ["theme",      "switch phosphor (amber/green/white)"],
          ["clear",      "clear the screen"],
          ["exit",       "close the terminal session"],
        ]},
        { title: "FUN", items: [
          ["weather",    "current weather (ASCII)"],
          ["ssh",        "try `ssh leon@hire-me`"],
          ["snake",      "play snake (arrows · ESC)"],
          ["matrix",     "follow the white rabbit"],
          ["sudo",       "feeling powerful?"],
        ]},
      ]},
      { type: "spacer" },
      { type: "muted", text: "tip: chain with `&&` or `;` · TAB to complete · ↑/↓ for history" },
      { type: "muted", text: "rumor: some destructive commands have... unexpected results. (try `rm -rf /`)" },
    ],
  },

  about: {
    desc: "who is leon pupier",
    run: () => [
      { type: "section", text: "// ABOUT" },
      { type: "text", text: "Hi — I'm Léon Pupier, a fullstack software developer." },
      { type: "text", text: "I design and build custom applications — from prototype to production — across web apps, APIs, internal tools and mobile apps." },
      { type: "text", text: "Rigorous, autonomous and results-driven, I adapt to both technical and business needs." },
      { type: "spacer" },
      { type: "kv", k: "role",     v: "Fullstack Software Developer" },
      { type: "kv", k: "focus",    v: "Web apps · APIs · Internal tools · Mobile" },
      { type: "kv", k: "approach", v: "pragmatic — efficiency, robustness, maintainability" },
      { type: "kv", k: "based",    v: "Lyon / Saint-Étienne, France · remote-first" },
    ],
  },

  whoami: {
    desc: "current session info",
    run: () => [
      { type: "text", text: "guest@leonpupier.fr" },
      { type: "muted", text: "uid=1000(guest) gid=1000(visitor) groups=1000(visitor),27(curious)" },
    ],
  },

  skills: {
    desc: "tech stack & tools",
    run: () => [
      { type: "section", text: "// SKILLS" },
      { type: "group", title: "languages",   items: ["Python", "JavaScript", "C", "C++", "HTML/CSS"] },
      { type: "group", title: "frameworks",  items: ["Django", "FastAPI"] },
      { type: "group", title: "infra & ops", items: ["Docker", "docker-compose", "Linux", "Git", "MySQL"] },
      { type: "group", title: "specialties", items: ["API design", "Web scraping", "ERP customization", "DevOps", "Process automation"] },
    ],
  },

  experience: {
    desc: "professional history",
    run: () => [
      { type: "section", text: "// EXPERIENCE" },
      { type: "exp", role: "Software Developer & Operations Support", org: "KLB Armes", period: "current", points: [
        "Develop internal tools tailored to the team's daily workflows.",
        "Optimize and automate operational processes.",
        "Provide administrative support for regulated firearms sales.",
      ]},
      { type: "exp", role: "Software Developer", org: "KLB Armes", period: "previous", points: [
        "Improved the company's information system end-to-end.",
        "Worked on logistics tooling and internal communication flows.",
        "Maintained the company website and supporting infrastructure.",
      ]},
    ],
  },

  education: {
    desc: "academic background",
    run: () => [
      { type: "section", text: "// EDUCATION" },
      { type: "exp", role: "École 42", org: "Lyon, France", period: "peer-to-peer software engineering", points: [
        "Project-based curriculum: C, C++, systems, networking, web.",
        "Selected projects: Libft, ft_printf, minishell, cub3D, IRC server, Inception, Transcendence.",
        "Self-directed learning · pair programming · code review culture.",
      ]},
    ],
  },

  now: {
    desc: "what i'm working on right now",
    run: () => [
      { type: "section", text: "// NOW" },
      { type: "kv", k: "working at", v: "KLB Armes — software dev & operations support" },
      { type: "kv", k: "building",   v: "internal tools and process automations" },
      { type: "kv", k: "based in",   v: "Lyon / Saint-Étienne · mostly remote" },
      { type: "kv", k: "available",  v: "open to freelance contracts" },
      { type: "spacer" },
      { type: "muted", text: "// last updated " + new Date().toISOString().slice(0, 10) },
    ],
  },

  contact: {
    desc: "how to reach me / socials",
    run: () => [
      { type: "section", text: "// CONTACT" },
      { type: "text", text: "Reach me on LinkedIn, GitHub, or by email." },
      { type: "spacer" },
      { type: "link", label: "linkedin ", url: "https://www.linkedin.com/in/l%C3%A9on-pupier0420/", display: "linkedin.com/in/léon-pupier" },
      { type: "link", label: "github   ", url: "https://github.com/LeonPupier", display: "github.com/LeonPupier" },
      { type: "link", label: "email    ", url: "mailto:public_contact.l2qt6@slmail.me", display: "public_contact.l2qt6@slmail.me" },
      { type: "spacer" },
      { type: "muted", text: "open to: freelance · contract · interesting collaborations" },
    ],
  },

  ls: {
    desc: "list site sections",
    run: () => [
      { type: "ls", items: [
        ["about.md",       "1.4K"],
        ["skills.json",    "0.9K"],
        ["experience.log", "2.1K"],
        ["education.txt",  "0.6K"],
        ["now.txt",        "0.3K"],
        ["contact.eml",    "0.4K"],
      ]},
    ],
  },

  date: {
    desc: "current system date",
    run: () => {
      const d = new Date();
      const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const pad = n => String(n).padStart(2, "0");
      const tz = -d.getTimezoneOffset();
      const tzSign = tz >= 0 ? "+" : "-";
      const tzH = pad(Math.floor(Math.abs(tz) / 60));
      const tzM = pad(Math.abs(tz) % 60);
      const stamp = `${days[d.getDay()]} ${months[d.getMonth()]} ${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${tzSign}${tzH}${tzM} ${d.getFullYear()}`;
      return [{ type: "text", text: stamp }];
    },
  },

  uname: {
    desc: "system info",
    run: () => [{ type: "text", text: "leonOS 1.0.0 #stable x86_64 GNU/Linux" }],
  },

  banner: {
    desc: "redraw the ascii banner",
    run: () => [{ type: "banner" }],
  },

  weather: {
    desc: "current weather",
    run: (args) => {
      const cities = {
        paris:    { name: "Paris, FR",     temp: 14, cond: "rain",    wind: 18 },
        lyon:     { name: "Lyon, FR",      temp: 16, cond: "clouds",  wind: 9  },
        marseille:{ name: "Marseille, FR", temp: 21, cond: "sun",     wind: 22 },
        london:   { name: "London, UK",    temp: 11, cond: "rain",    wind: 14 },
        nyc:      { name: "New York, US",  temp: 18, cond: "sun",     wind: 11 },
        tokyo:    { name: "Tokyo, JP",     temp: 22, cond: "clouds",  wind: 7  },
      };
      const key = (args[0] || "paris").toLowerCase();
      const w = cities[key] || cities.paris;
      const arts = {
        sun: [
          "    \\   /    ",
          "     .-.      ",
          "  ‒ (   ) ‒   ",
          "     `-’      ",
          "    /   \\     ",
        ],
        clouds: [
          "              ",
          "      .--.    ",
          "   .-(    ).  ",
          "  (___.__)__) ",
          "              ",
        ],
        rain: [
          "      .-.     ",
          "     (   ).   ",
          "    (___(__)  ",
          "     ‘ ‘ ‘ ‘  ",
          "    ‘ ‘ ‘ ‘   ",
        ],
      };
      const art = arts[w.cond];
      const info = [
        `${w.name}`,
        `${w.cond}`,
        `${w.temp}°C`,
        `${w.wind} km/h`,
        ``,
      ];
      const rows = art.map((line, i) => `${line}   ${info[i] || ""}`);
      return [
        { type: "section", text: "// WEATHER" },
        { type: "raw", text: rows.join("\n") },
        { type: "muted", text: "// try: weather lyon · marseille · london · nyc · tokyo" },
      ];
    },
  },

  history: {
    desc: "command history",
    run: () => "__history__",
  },

  ssh: {
    desc: "connect to a remote",
    run: (args) => {
      const target = (args[0] || "").toLowerCase();
      if (!target) {
        return [{ type: "error", text: "ssh: usage: ssh user@host" }];
      }
      if (target === "leon@hire-me" || target === "leon@hire-me.fr" || target === "hire@leon") {
        return [
          { type: "muted", text: "The authenticity of host 'hire-me (203.0.113.42)' can't be established." },
          { type: "muted", text: "ED25519 key fingerprint is SHA256:lE0nPup1eR/READYtoSHIP/feb4cee2..." },
          { type: "muted", text: "Are you sure you want to continue connecting (yes/no)? yes" },
          { type: "muted", text: "Warning: Permanently added 'hire-me' to the list of known hosts." },
          { type: "muted", text: "leon@hire-me's password: ************" },
          { type: "spacer" },
          { type: "text", text: "Welcome to Léon's inbox 🚀" },
          { type: "text", text: "If you're hiring or want to collaborate — reach out:" },
          { type: "spacer" },
          { type: "link", label: "linkedin ", url: "https://www.linkedin.com/in/l%C3%A9on-pupier0420/", display: "linkedin.com/in/léon-pupier" },
          { type: "link", label: "github   ", url: "https://github.com/LeonPupier", display: "github.com/LeonPupier" },
          { type: "link", label: "email    ", url: "mailto:public_contact.l2qt6@slmail.me", display: "public_contact.l2qt6@slmail.me" },
          { type: "spacer" },
          { type: "muted", text: "Connection to hire-me closed." },
        ];
      }
      const [, host] = target.split("@");
      return [
        { type: "muted", text: `ssh: Could not resolve hostname ${host || target}: Name or service not known` },
        { type: "muted", text: "hint: try `ssh leon@hire-me`" },
      ];
    },
  },

  snake: {
    desc: "play snake",
    run: () => "__snake__",
  },

  clear: {
    desc: "clear the screen",
    run: () => "__clear__",
  },
  cls: {
    hidden: true,
    run: () => "__clear__",
  },

  // easter eggs (not in `help`)
  sudo: {
    hidden: true,
    run: (args) => {
      if (args.join(" ").includes("coffee")) {
        return [
          { type: "text", text: "brewing... ☕" },
          { type: "muted", text: "[==========================] 100%" },
          { type: "text", text: "coffee ready. enjoy." },
        ];
      }
      return [
        { type: "error", text: "guest is not in the sudoers file. This incident will be reported." },
      ];
    },
  },
  hack: {
    hidden: true,
    run: () => [
      { type: "text", text: "INITIATING MAINFRAME BREACH..." },
      { type: "muted", text: "bypassing firewall... ████████░░ 80%" },
      { type: "muted", text: "decrypting payload... ██████████ 100%" },
      { type: "text", text: "ACCESS GRANTED." },
      { type: "muted", text: "(just kidding. nothing was hacked. you should hire me though.)" },
    ],
  },
  matrix: {
    hidden: true,
    run: () => "__matrix__",
  },
  "rm": {
    hidden: true,
    run: (args) => {
      if (args.includes("-rf") && (args.includes("/") || args.includes("--no-preserve-root"))) {
        return "__rmrf__";
      }
      if (!args.length) return [{ type: "error", text: "rm: missing operand" }];
      return [{ type: "error", text: `rm: cannot remove '${args[args.length - 1]}': Permission denied` }];
    },
  },
  theme: {
    desc: "switch phosphor color",
    run: (args) => {
      const t = (args[0] || "").toLowerCase();
      const allowed = ["amber", "green", "white"];
      if (!t) return [
        { type: "muted", text: "available phosphors: amber · green · white" },
        { type: "muted", text: "usage: theme <name>" },
      ];
      if (!allowed.includes(t)) return [{ type: "error", text: `theme: unknown phosphor '${t}'` }];
      return "__theme__:" + t;
    },
  },
  exit: {
    desc: "close the terminal session",
    run: () => "__exit__",
  },
  vim: {
    hidden: true,
    run: () => [{ type: "muted", text: "you wouldn't be able to leave anyway." }],
  },
  emacs: {
    hidden: true,
    run: () => [{ type: "muted", text: "have you tried vim?" }],
  },
};

// ASCII banner — bigger / bolder block letters with flair
const ASCII_BANNER = String.raw`
   ██╗     ███████╗ ██████╗ ███╗   ██╗    ██████╗ ██╗   ██╗██████╗ ██╗███████╗██████╗ 
   ██║     ██╔════╝██╔═══██╗████╗  ██║    ██╔══██╗██║   ██║██╔══██╗██║██╔════╝██╔══██╗
   ██║     █████╗  ██║   ██║██╔██╗ ██║    ██████╔╝██║   ██║██████╔╝██║█████╗  ██████╔╝
   ██║     ██╔══╝  ██║   ██║██║╚██╗██║    ██╔═══╝ ██║   ██║██╔═══╝ ██║██╔══╝  ██╔══██╗
   ███████╗███████╗╚██████╔╝██║ ╚████║    ██║     ╚██████╔╝██║     ██║███████╗██║  ██║
   ╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝    ╚═╝      ╚═════╝ ╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝
   ─────────────────────  fullstack developer · prototype → prod  ────────────────────
`;

const ASCII_BANNER_NARROW = String.raw`
 _    ___ ___  _  _   ___ _   _ ___ ___ ___ ___
| |  | __/ _ \| \| | | _ \ | | | _ \_ _| __| _ \
| |__| _| (_) | .  | |  _/ |_| |  _/| || _||   /
|____|___\___/|_|\_| |_|  \___/|_| |___|___|_|_\
   fullstack developer · prototype → production
`;

// ──────────────────────────────────────────────
// Audio — synthesized typewriter clicks (no assets)

let audioCtx = null;
function ensureAudio() {
  if (audioCtx) return audioCtx;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  } catch (e) { return null; }
  return audioCtx;
}

// Pre-baked typewriter click variations — different shapes, pitches, attacks
const KEY_VARIANTS = [
  { freq: 1450, type: "square",   attack: 0.0015, decay: 0.038 }, // crisp tap
  { freq: 1180, type: "square",   attack: 0.002,  decay: 0.045 }, // softer tap
  { freq: 1620, type: "triangle", attack: 0.001,  decay: 0.032 }, // bright tick
  { freq: 950,  type: "square",   attack: 0.003,  decay: 0.052 }, // dull thunk
  { freq: 1340, type: "sawtooth", attack: 0.0015, decay: 0.034 }, // mech buzz
];

function playClick(volume = 0.08) {
  const ctx = ensureAudio();
  if (!ctx) return;
  // Skip cleanly if browser hasn't unlocked audio yet — avoids "AudioContext
  // was not allowed to start" warnings spamming the console during boot.
  // The audio primer in terminal-app.jsx will resume() on first user gesture.
  if (ctx.state !== "running") return;
  const t = ctx.currentTime;
  const v = KEY_VARIANTS[Math.floor(Math.random() * KEY_VARIANTS.length)];
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  // small detune per-press for organic feel
  osc.frequency.value = v.freq * (0.92 + Math.random() * 0.16);
  osc.type = v.type;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume * (0.85 + Math.random() * 0.3), t + v.attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + v.decay);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + v.decay + 0.01);
}

// Distinctive sounds for special keys (so backspace/enter/space don't all sound the same)
function playKeySpace(volume = 0.06) {
  const ctx = ensureAudio();
  if (!ctx) return;
  // Skip cleanly if browser hasn't unlocked audio yet — avoids "AudioContext
  // was not allowed to start" warnings spamming the console during boot.
  // The audio primer in terminal-app.jsx will resume() on first user gesture.
  if (ctx.state !== "running") return;
  const t = ctx.currentTime;
  // bigger, lower, slightly longer "thunk"
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 380 + Math.random() * 80;
  osc.type = "square";
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.07);
}

function playKeyBackspace(volume = 0.07) {
  const ctx = ensureAudio();
  if (!ctx) return;
  // Skip cleanly if browser hasn't unlocked audio yet — avoids "AudioContext
  // was not allowed to start" warnings spamming the console during boot.
  // The audio primer in terminal-app.jsx will resume() on first user gesture.
  if (ctx.state !== "running") return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  // descending pitch — feels like erasing
  osc.frequency.setValueAtTime(900, t);
  osc.frequency.exponentialRampToValueAtTime(620, t + 0.04);
  osc.type = "triangle";
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.05);
}

function playKeyEnter(volume = 0.1) {
  const ctx = ensureAudio();
  if (!ctx) return;
  // Skip cleanly if browser hasn't unlocked audio yet — avoids "AudioContext
  // was not allowed to start" warnings spamming the console during boot.
  // The audio primer in terminal-app.jsx will resume() on first user gesture.
  if (ctx.state !== "running") return;
  const t = ctx.currentTime;
  // a "ka-chunk" — two stacked notes
  const o1 = ctx.createOscillator(); const g1 = ctx.createGain();
  o1.frequency.value = 720; o1.type = "square";
  g1.gain.setValueAtTime(0, t); g1.gain.linearRampToValueAtTime(volume, t + 0.002);
  g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  o1.connect(g1).connect(ctx.destination); o1.start(t); o1.stop(t + 0.07);
  const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
  o2.frequency.value = 240; o2.type = "sawtooth";
  g2.gain.setValueAtTime(0, t + 0.01); g2.gain.linearRampToValueAtTime(volume * 0.6, t + 0.014);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  o2.connect(g2).connect(ctx.destination); o2.start(t + 0.01); o2.stop(t + 0.09);
}

function playFocus(volume = 0.05) {
  const ctx = ensureAudio();
  if (!ctx) return;
  // Skip cleanly if browser hasn't unlocked audio yet — avoids "AudioContext
  // was not allowed to start" warnings spamming the console during boot.
  // The audio primer in terminal-app.jsx will resume() on first user gesture.
  if (ctx.state !== "running") return;
  const t = ctx.currentTime;
  // soft "ready" chirp — rising pitch
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(820, t);
  osc.frequency.exponentialRampToValueAtTime(1240, t + 0.08);
  osc.type = "sine";
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.12);
}

function playBeep(volume = 0.1, freq = 660, dur = 0.12, type = "sine") {
  const ctx = ensureAudio();
  if (!ctx) return;
  // Skip cleanly if browser hasn't unlocked audio yet — avoids "AudioContext
  // was not allowed to start" warnings spamming the console during boot.
  // The audio primer in terminal-app.jsx will resume() on first user gesture.
  if (ctx.state !== "running") return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// Low-frequency hum during boot (CRT power-up / fan)
function playHum(durMs = 800, volume = 0.025) {
  const ctx = ensureAudio();
  if (!ctx) return;
  // Skip cleanly if browser hasn't unlocked audio yet — avoids "AudioContext
  // was not allowed to start" warnings spamming the console during boot.
  // The audio primer in terminal-app.jsx will resume() on first user gesture.
  if (ctx.state !== "running") return;
  const t = ctx.currentTime;
  const dur = durMs / 1000;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 60;
  osc.type = "sawtooth";
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.05);
  gain.gain.linearRampToValueAtTime(volume * 0.6, t + dur * 0.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// Disk/loading rattle: a stream of short noisy clicks
function playDiskRattle(durMs = 600, volume = 0.06) {
  const ctx = ensureAudio();
  if (!ctx) return;
  // Skip cleanly if browser hasn't unlocked audio yet — avoids "AudioContext
  // was not allowed to start" warnings spamming the console during boot.
  // The audio primer in terminal-app.jsx will resume() on first user gesture.
  if (ctx.state !== "running") return;
  const start = ctx.currentTime;
  const dur = durMs / 1000;
  // pre-make a short noise buffer
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
  let elapsed = 0;
  while (elapsed < dur) {
    const at = start + elapsed;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(volume * (0.5 + Math.random() * 0.6), at + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.018);
    const filt = ctx.createBiquadFilter();
    filt.type = "highpass";
    filt.frequency.value = 1500 + Math.random() * 2000;
    src.connect(filt).connect(g).connect(ctx.destination);
    src.start(at);
    src.stop(at + 0.025);
    elapsed += 0.025 + Math.random() * 0.05;
  }
}

// CRT power-on "tick" — two-stage thunk
function playCrtPowerOn() {
  const ctx = ensureAudio();
  if (!ctx) return;
  // Skip cleanly if browser hasn't unlocked audio yet — avoids "AudioContext
  // was not allowed to start" warnings spamming the console during boot.
  // The audio primer in terminal-app.jsx will resume() on first user gesture.
  if (ctx.state !== "running") return;
  const t = ctx.currentTime;
  // low thunk
  const osc1 = ctx.createOscillator();
  const g1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(120, t);
  osc1.frequency.exponentialRampToValueAtTime(40, t + 0.18);
  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(0.18, t + 0.01);
  g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  osc1.connect(g1).connect(ctx.destination);
  osc1.start(t);
  osc1.stop(t + 0.25);
  // high "phht" white noise burst
  const noise = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const g2 = ctx.createGain();
  const filt = ctx.createBiquadFilter();
  filt.type = "bandpass";
  filt.frequency.value = 4500;
  g2.gain.setValueAtTime(0, t + 0.05);
  g2.gain.linearRampToValueAtTime(0.04, t + 0.06);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  src.connect(filt).connect(g2).connect(ctx.destination);
  src.start(t + 0.05);
  src.stop(t + 0.25);
}

Object.assign(window, {
  COMMANDS, ASCII_BANNER, ASCII_BANNER_NARROW,
  playClick, playBeep, playHum, playDiskRattle, playCrtPowerOn, ensureAudio,
  playKeySpace, playKeyBackspace, playKeyEnter, playFocus,
});
