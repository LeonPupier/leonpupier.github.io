// Main terminal app — boot sequence, prompt, input, history, ghost suggest

const { useState, useEffect, useRef, useCallback } = React;

const PROMPT = "guest@leonpupier:~$ ";

// Boot sequence — full BIOS/POST → kernel boot, with audio cues per line.
const BOOT_LINES = [
  // ─────────── BIOS / POST stage ───────────
  { text: "",                                                                                 delay: 80,   sound: null },
  { text: "Curiosity BIOS v2.1.0 — Copyright (C) 1997-2025 Léon Pupier",                       delay: 220,  sound: "power" },
  { text: "Platform: leonOS Hardware Reference Board · BIOS Date: 11/19/2025",                 delay: 70,   sound: null },
  { text: "",                                                                                 delay: 100,  sound: null },
  { text: "POST: Power-On Self Test ........................... [ INIT ]",                    delay: 100,  sound: "click" },
  { text: "  CPU: Intel(R) Curiosity(TM) i9 @ 4.20GHz ......... [  OK  ]",                    delay: 80,   sound: "click" },
  { text: "  L1 cache 64K · L2 cache 1024K · L3 cache 16384K .. [  OK  ]",                    delay: 70,   sound: null },
  { text: "  Memory test: 16384MB OK ......................... [  OK  ]",                    delay: 110,  sound: "rattle" },
  { text: "  Detecting IDE drives:",                                                          delay: 60,   sound: null },
  { text: "    Primary Master   : LEON-DISK-512G",                                            delay: 60,   sound: null },
  { text: "    Primary Slave    : none",                                                      delay: 50,   sound: null },
  { text: "    Secondary Master : VIRTUAL-CDROM v3.14",                                       delay: 50,   sound: null },
  { text: "  USB controller v3.2 .............................. [  OK  ]",                    delay: 60,   sound: "click" },
  { text: "  Network adapter eth0 ............................. [  OK  ]",                    delay: 70,   sound: "click" },
  { text: "  Audio codec AC'97 ................................ [  OK  ]",                    delay: 60,   sound: null },
  { text: "POST complete. Hand-off to bootloader.",                                            delay: 120,  sound: "beep" },
  { text: "",                                                                                 delay: 150,  sound: null },
  { text: "GRUB 2.06 — selecting default entry: leonOS",                                       delay: 100,  sound: null },
  { text: "Loading vmlinuz-6.6.0-leon ........................ [  OK  ]",                     delay: 110,  sound: "rattle" },
  { text: "Loading initrd.img-6.6.0-leon ..................... [  OK  ]",                     delay: 100,  sound: "rattle" },
  { text: "",                                                                                 delay: 100,  sound: null },
  // ─────────── Kernel boot stage ───────────
  { text: "leonOS v1.0.0 (release-stable) — kernel 6.6.0-leon",                               delay: 120,  sound: "power" },
  { text: "Copyright (c) Léon Pupier · all rights reserved.",                                 delay: 60,   sound: null },
  { text: "[    0.000000] BIOS-provided physical RAM map:",                                   delay: 70,   sound: "click" },
  { text: "[    0.000023]   BIOS-e820: [mem 0x0000000000000000-0x000000000009ffff] usable",   delay: 50,   sound: null },
  { text: "[    0.000041]   BIOS-e820: [mem 0x0000000000100000-0x000000007ffeffff] usable",   delay: 50,   sound: null },
  { text: "[    0.002817] smpboot: Booting CPU 0 ............................. [ OK ]",       delay: 90,   sound: "click" },
  { text: "[    0.004012] smpboot: Booting CPU 1 ............................. [ OK ]",       delay: 70,   sound: "click" },
  { text: "[    0.005391] ACPI: Core revision 20231215",                                      delay: 50,   sound: null },
  { text: "[    0.014820] Loading kernel modules .................. [ OK ]",                  delay: 110,  sound: "rattle" },
  { text: "[    0.022591] systemd[1]: Detected virtualization curiosity-vm.",                 delay: 60,   sound: null },
  { text: "[    0.043091] EXT4-fs (sda1): mounted /dev/leon ........ [ OK ]",                 delay: 100,  sound: "rattle" },
  { text: "[    0.056720] random: crng init done",                                            delay: 60,   sound: null },
  { text: "[    0.071409] Starting Journal Service ................. [ OK ]",                 delay: 80,   sound: "click" },
  { text: "[    0.108551] Starting network: eth0 ................... [ OK ]",                 delay: 100,  sound: "beep" },
  { text: "[    0.121884]   IPv4 lease: 192.168.42.1 / 24",                                   delay: 60,   sound: null },
  { text: "[    0.158220] sshd: server listening on 0.0.0.0 port 22 . [ OK ]",                delay: 80,   sound: "click" },
  { text: "[    0.190442] Mounting /home/leon ...................... [ OK ]",                 delay: 110,  sound: "rattle" },
  { text: "[    0.214708] Mounting /var/projects ................... [ OK ]",                 delay: 90,   sound: "rattle" },
  { text: "[    0.221874] Initializing curiosity daemon ............ [ OK ]",                 delay: 80,   sound: "click" },
  { text: "[    0.262710] Indexing /var/projects ................... [ OK ]",                 delay: 100,  sound: "rattle" },
  { text: "[    0.281044] Cache warm: 27 repos, 142 commits.",                                delay: 60,   sound: null },
  { text: "[    0.302199] Starting docker.service .................. [ OK ]",                 delay: 90,   sound: "click" },
  { text: "[    0.349019] Spawning interactive shell /bin/leon ..... [ OK ]",                 delay: 110,  sound: "beep" },
  { text: "",                                                                                 delay: 120,  sound: null },
  { text: "Welcome to leonOS — login: guest (auto)",                                          delay: 100,  sound: "bigbeep" },
  { text: "Last login: " + new Date().toUTCString() + " from human.tty",                      delay: 80,   sound: null },
  { text: "",                                                                                 delay: 250,  sound: null },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function playBootSound(kind) {
  switch (kind) {
    case "power":   playCrtPowerOn(); break;
    case "hum":     playHum(900, 0.025); break;
    case "rattle":  playDiskRattle(380 + Math.random() * 200, 0.05); break;
    case "click":   playClick(0.05); break;
    case "beep":    playBeep(0.06, 760, 0.1); break;
    case "bigbeep": playBeep(0.09, 920, 0.18); break;
    default: break;
  }
}

// Argument suggestions for smarter tab completion
const ARG_HINTS = {
  weather: ["paris", "lyon", "marseille", "london", "nyc", "tokyo"],
  ssh:     ["leon@hire-me"],
  sudo:    ["make-me-a-coffee"],
  rm:      ["-rf"],
};

function commonPrefix(strings) {
  if (!strings.length) return "";
  let pref = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].startsWith(pref)) pref = pref.slice(0, -1);
    if (!pref) return "";
  }
  return pref;
}

function Terminal({ tweaks }) {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState("");
  const [booted, setBooted] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [showMatrix, setShowMatrix] = useState(false);
  const [closeStage, setCloseStage] = useState(0); // 0=idle, 1=closing, 2=error, 3=glitching, 4=escape
  const [focused, setFocused] = useState(true);
  const [caretPos, setCaretPos] = useState(0);
  const [ghost, setGhost] = useState("");
  const [errorFlash, setErrorFlash] = useState(0);
  const [copyToast, setCopyToast] = useState("");
  const [typing, setTyping] = useState(false);
  const typingTimerRef = useRef(null);
  const focusedOnceRef = useRef(false);

  const inputRef = useRef(null);
  const measureRef = useRef(null);
  const scrollRef = useRef(null);
  const tweaksRef = useRef(tweaks);
  tweaksRef.current = tweaks;
  const bannerDoneResolveRef = useRef(null);
  const historyRef = useRef([]);
  historyRef.current = history;

  const onBannerDone = useCallback(() => {
    if (bannerDoneResolveRef.current) {
      bannerDoneResolveRef.current();
      bannerDoneResolveRef.current = null;
    }
  }, []);

  // autoscroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const focusInput = useCallback(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const updateCaret = useCallback(() => {
    const el = inputRef.current;
    const meas = measureRef.current;
    if (!el || !meas) return;
    const pos = el.selectionStart ?? input.length;
    meas.textContent = input.substring(0, pos);
    setCaretPos(meas.offsetWidth);
  }, [input]);

  useEffect(() => { updateCaret(); }, [input, updateCaret]);

  // Compute ghost suggestion (auto-suggest fantôme)
  useEffect(() => {
    if (!input) { setGhost(""); return; }
    // 1) recent history match (most recent first)
    for (let i = historyRef.current.length - 1; i >= 0; i--) {
      const h = historyRef.current[i];
      if (h !== input && h.startsWith(input)) { setGhost(h.slice(input.length)); return; }
    }
    // 2) command-name match
    const visible = Object.keys(COMMANDS).filter(k => !COMMANDS[k].hidden);
    const m = visible.find(k => k.startsWith(input.toLowerCase()) && k !== input.toLowerCase());
    if (m) { setGhost(m.slice(input.length)); return; }
    setGhost("");
  }, [input]);

  // boot
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (tweaksRef.current.sound) ensureAudio();
      await sleep(250);

      const out = [];
      for (const b of BOOT_LINES) {
        if (cancelled) return;
        out.push({ type: "muted", text: b.text });
        setLines([...out]);
        if (tweaksRef.current.sound && b.sound) playBootSound(b.sound);
        await sleep(b.delay);
      }

      const bannerText = window.innerWidth < 720 ? ASCII_BANNER_NARROW : ASCII_BANNER;
      const bannerDone = new Promise(resolve => { bannerDoneResolveRef.current = resolve; });
      out.push({ type: "anim-banner", text: bannerText, soundOn: tweaksRef.current.sound });
      setLines([...out]);
      await bannerDone;
      await sleep(180);

      out.push({ type: "spacer" });
      out.push({ type: "text", text: "Welcome — fullstack software developer · web apps · APIs · internal tools." });
      out.push({ type: "muted", text: "Type `help` to see what's available. Try `about`, `now`, or `contact`." });
      out.push({ type: "muted", text: "Tip: chain commands with `&&` or `;` (e.g. `whoami && now`)." });
      out.push({ type: "spacer" });
      setLines([...out]);
      if (tweaksRef.current.sound) playBeep(0.08, 1040, 0.14);
      setBooted(true);
      setTimeout(focusInput, 50);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.activeElement !== inputRef.current && inputRef.current) {
        if (e.key.length === 1) inputRef.current.focus();
      }
      if (!tweaksRef.current.sound) return;
      if (e.key === " ") playKeySpace(0.05);
      else if (e.key === "Enter") playKeyEnter(0.09);
      else if (e.key === "Backspace") playKeyBackspace(0.06);
      else if (e.key === "Tab") playClick(0.07);
      else if (e.key.length === 1) playClick(0.05);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Smart copy on click — links auto-copy URL with toast
  const onLinkCopy = useCallback((url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopyToast(`copied: ${url}`);
        if (tweaksRef.current.sound) playBeep(0.05, 1200, 0.08);
        setTimeout(() => setCopyToast(""), 1800);
      });
    }
  }, []);

  const onSnakeExit = useCallback((finalScore) => {
    pushLines([
      { type: "muted", text: `snake exited. final score: ${finalScore || 0}` },
    ]);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  }, []);

  const triggerCloseGag = useCallback(() => {
    if (closeStage !== 0) return;
    // Stage 1: window appears to close (shrinks/blackouts) ~700ms
    setCloseStage(1);
    if (tweaksRef.current.sound) playBeep(0.08, 320, 0.16);
    setTimeout(() => playClick && playClick(0.08), 380);

    // Stage 2: error popup ~1400ms
    setTimeout(() => {
      setCloseStage(2);
      if (tweaksRef.current.sound) {
        playBeep(0.12, 180, 0.22);
        setTimeout(() => playBeep(0.10, 180, 0.18), 180);
      }
    }, 700);

    // Stage 3: glitching takes over ~1000ms
    setTimeout(() => {
      setCloseStage(3);
      if (tweaksRef.current.sound) {
        playDiskRattle(120, 0.15);
        setTimeout(() => playBeep(0.1, 90, 0.4), 100);
      }
    }, 2400);

    // Stage 4: matrix-style escape attempt ~900ms
    setTimeout(() => {
      setCloseStage(4);
    }, 3400);

    // Stage 5: snap back, print mocking line
    setTimeout(() => {
      setCloseStage(0);
      pushLines([
        { type: "error", text: "✗ exit denied · process is trapped in the simulation" },
        { type: "muted", text: "(nice try. you can't really leave a website by clicking ×)" },
      ]);
      if (tweaksRef.current.sound) playBeep(0.06, 1040, 0.14);
      setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 80);
    }, 4300);
  }, [closeStage]);

  function pushLines(newLines) {
    setLines(prev => [...prev, ...newLines]);
  }

  // ──────────────────────────────────────────
  // ASCII spinner overlay — replaces a placeholder line, then resolves with a final result
  async function runWithSpinner(label, durationMs, finalLines) {
    const frames = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
    let frame = 0;
    let id;
    // push a placeholder line
    let placeholderIndex;
    setLines(prev => {
      placeholderIndex = prev.length;
      return [...prev, { type: "muted", text: `${frames[0]} ${label}` }];
    });
    return new Promise((resolve) => {
      const start = performance.now();
      const tick = () => {
        const elapsed = performance.now() - start;
        if (elapsed >= durationMs) {
          clearInterval(id);
          // replace placeholder with final lines
          setLines(prev => {
            const next = [...prev];
            next.splice(placeholderIndex, 1, ...finalLines);
            return next;
          });
          resolve();
          return;
        }
        frame = (frame + 1) % frames.length;
        setLines(prev => {
          const next = [...prev];
          next[placeholderIndex] = { type: "muted", text: `${frames[frame]} ${label}` };
          return next;
        });
      };
      id = setInterval(tick, 90);
    });
  }

  // ──────────────────────────────────────────
  // rm -rf / prank — fake destructive sequence
  async function runRmRfPrank() {
    const targets = [
      "/bin", "/etc", "/usr", "/var", "/home/leon", "/lib", "/opt",
      "/proc", "/sys", "/tmp", "/root", "/boot", "/dev",
    ];
    pushLines([
      { type: "error", text: "rm: are you sure? this CANNOT be undone." },
      { type: "muted", text: "proceeding in 3..." },
    ]);
    if (tweaksRef.current.sound) playBeep(0.08, 220, 0.18);
    await sleep(550);
    pushLines([{ type: "muted", text: "2..." }]);
    if (tweaksRef.current.sound) playBeep(0.08, 260, 0.18);
    await sleep(450);
    pushLines([{ type: "muted", text: "1..." }]);
    if (tweaksRef.current.sound) playBeep(0.08, 320, 0.18);
    await sleep(400);
    pushLines([{ type: "error", text: "DELETING..." }]);
    if (tweaksRef.current.sound) playDiskRattle(800, 0.08);
    triggerErrorGlitch();

    // stream fake "removed" lines fast
    for (const t of targets) {
      await sleep(80 + Math.random() * 120);
      // mix some files inside dirs
      const subs = ["", "/.config", "/cache", "/main.bin", "/index.lock", "/log"];
      const sub = subs[Math.floor(Math.random() * subs.length)];
      pushLines([{ type: "muted", text: `removed '${t}${sub}'` }]);
      if (tweaksRef.current.sound && Math.random() < 0.4) playClick(0.04);
    }
    await sleep(300);
    pushLines([
      { type: "spacer" },
      { type: "error", text: "rm: filesystem corrupted · kernel panic imminent" },
    ]);
    if (tweaksRef.current.sound) playBeep(0.1, 140, 0.5);
    triggerErrorGlitch();
    await sleep(900);

    pushLines([
      { type: "spacer" },
      { type: "muted", text: "...just kidding. this is a static site." },
      { type: "muted", text: "nothing was actually deleted. but you're certainly curious." },
      { type: "muted", text: "if you like that energy → try `ssh leon@hire-me`" },
    ]);
    if (tweaksRef.current.sound) playBeep(0.06, 1040, 0.14);
  }

  function splitChain(raw) {
    return raw
      .split(/\s*(?:&&|;)\s*/g)
      .map(s => s.trim())
      .filter(Boolean);
  }

  const triggerErrorGlitch = useCallback(() => {
    setErrorFlash(n => n + 1);
    setTimeout(() => setErrorFlash(n => Math.max(0, n - 1)), 350);
  }, []);

  const runSingle = useCallback(async (trimmed) => {
    if (!trimmed) return;
    const [cmdName, ...args] = trimmed.split(/\s+/);
    const cmd = COMMANDS[cmdName.toLowerCase()];

    if (!cmd) {
      pushLines([
        { type: "error", text: `command not found: ${cmdName}` },
        { type: "muted", text: "type `help` for available commands." },
      ]);
      triggerErrorGlitch();
      if (tweaksRef.current.sound) playBeep(0.08, 220, 0.15);
      return;
    }

    const result = cmd.run(args);

    if (result === "__clear__") {
      setLines([]);
      return;
    }
    if (result === "__matrix__") {
      await runWithSpinner("connecting to mainframe", 700, [
        { type: "muted", text: "wake up... follow the white rabbit." }
      ]);
      setShowMatrix(true);
      return;
    }
    if (result === "__snake__") {
      pushLines([{ type: "snake-inline" }]);
      return;
    }
    if (result === "__history__") {
      const hist = historyRef.current;
      if (!hist.length) {
        pushLines([{ type: "muted", text: "(empty)" }]);
        return;
      }
      pushLines([
        { type: "section", text: "// HISTORY" },
        ...hist.map((h, i) => ({
          type: "raw",
          text: `${String(i + 1).padStart(4, " ")}  ${h}`,
        })),
      ]);
      return;
    }
    if (result === "__rmrf__") {
      await runRmRfPrank();
      return;
    }
    if (typeof result === "string" && result.startsWith("__theme__:")) {
      const theme = result.slice("__theme__:".length);
      window.dispatchEvent(new CustomEvent("__set_theme", { detail: theme }));
      pushLines([
        { type: "muted", text: `phosphor switched → ${theme}` },
      ]);
      if (tweaksRef.current.sound) playBeep(0.06, 920, 0.1);
      return;
    }

    const enriched = result.map(r =>
      r.type === "banner" && !r.text
        ? { type: "anim-banner", text: window.innerWidth < 720 ? ASCII_BANNER_NARROW : ASCII_BANNER, soundOn: tweaksRef.current.sound }
        : r
    );

    pushLines(enriched);
    if (tweaksRef.current.sound) playBeep(0.04, 880, 0.06);
  }, [triggerErrorGlitch]);

  const runCommand = useCallback(async (raw) => {
    const echoLine = { type: "prompt", prompt: PROMPT, cmd: raw };
    pushLines([echoLine]);

    const trimmed = raw.trim();
    if (!trimmed) return;

    setHistory(h => [...h, trimmed]);
    setHistoryIdx(-1);

    const chain = splitChain(trimmed);
    for (const c of chain) {
      await runSingle(c);
    }
  }, [runSingle]);

  function onSubmit(e) {
    e.preventDefault();
    runCommand(input);
    setInput("");
    setGhost("");
  }

  function acceptGhost() {
    if (!ghost) return false;
    setInput(input + ghost);
    setGhost("");
    return true;
  }

  function onKeyDown(e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(next);
      setInput(history[next] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const next = historyIdx + 1;
      if (next >= history.length) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(next);
        setInput(history[next]);
      }
    } else if (e.key === "ArrowRight") {
      // accept ghost when caret is at end
      const el = inputRef.current;
      if (el && ghost && el.selectionStart === input.length) {
        e.preventDefault();
        acceptGhost();
      }
    } else if (e.key === "End") {
      if (ghost) { e.preventDefault(); acceptGhost(); }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Smart completion: command first, then args
      const parts = input.split(/(\s+)/); // keep separators
      const tokens = input.split(/\s+/);
      const lastIdx = tokens.length - 1;
      const last = tokens[lastIdx] || "";

      if (lastIdx === 0) {
        // completing command name
        const visible = Object.keys(COMMANDS).filter(k => !COMMANDS[k].hidden);
        const matches = visible.filter(k => k.startsWith(last.toLowerCase()));
        if (matches.length === 1) {
          setInput(matches[0] + " ");
        } else if (matches.length > 1) {
          const pref = commonPrefix(matches);
          if (pref.length > last.length) setInput(pref);
          pushLines([
            { type: "prompt", prompt: PROMPT, cmd: input },
            { type: "muted", text: matches.join("    ") },
          ]);
        }
      } else {
        // completing argument for a command
        const cmdName = tokens[0].toLowerCase();
        const hints = ARG_HINTS[cmdName] || [];
        const matches = hints.filter(h => h.startsWith(last));
        if (matches.length === 1) {
          tokens[lastIdx] = matches[0];
          setInput(tokens.join(" "));
        } else if (matches.length > 1) {
          const pref = commonPrefix(matches);
          if (pref.length > last.length) {
            tokens[lastIdx] = pref;
            setInput(tokens.join(" "));
          }
          pushLines([
            { type: "prompt", prompt: PROMPT, cmd: input },
            { type: "muted", text: matches.join("    ") },
          ]);
        }
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }

  // Konami code: ↑↑↓↓←→←→BA — toggles a "secret debug" mode
  const [konami, setKonami] = useState(false);
  useEffect(() => {
    const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let pos = 0;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      const expect = seq[pos].toLowerCase();
      if (k === expect) {
        pos++;
        if (pos === seq.length) {
          pos = 0;
          setKonami(k => !k);
          pushLines([
            { type: "section", text: "// 🐉 KONAMI MODE ENGAGED" },
            { type: "muted", text: "30 lives unlocked. inverted phosphor activated." },
            { type: "muted", text: "(press the sequence again to disengage.)" },
          ]);
          if (tweaksRef.current.sound) {
            playBeep(0.08, 880, 0.1);
            setTimeout(() => playBeep(0.08, 1100, 0.1), 100);
            setTimeout(() => playBeep(0.1, 1320, 0.18), 200);
          }
        }
      } else {
        pos = (k === seq[0].toLowerCase()) ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const themeClass = `theme-${tweaks.theme || "green"}`;
  const scanClass = tweaks.scanlines ? "scan-on" : "scan-off";
  const flickerClass = tweaks.flicker ? "flicker-on" : "flicker-off";
  const burnClass = tweaks.burnIn !== false ? "burn-on" : "burn-off";
  const curveClass = tweaks.curvature !== false ? "curve-on" : "curve-off";

  const closeStageClass =
    closeStage === 1 ? "closing" :
    closeStage === 3 ? "close-glitch" :
    closeStage === 4 ? "close-escape" : "";

  return (
    <>
      <div className={`crt-outer ${curveClass}`}>
        <div
          className={`crt-frame ${themeClass} ${scanClass} ${flickerClass} ${burnClass} ${konami ? "konami" : ""} ${errorFlash > 0 ? "glitching" : ""} ${closeStageClass}`}
          onClick={focusInput}
        >
          <div className="crt-screen">
            <div className="window">
              <div className="window-chrome">
                <div className="dots">
                  <button
                    type="button"
                    className="dot dot-r"
                    aria-label="Close terminal"
                    onClick={(e) => { e.stopPropagation(); triggerCloseGag(); }}
                  ></button>
                  <span className="dot dot-y"></span>
                  <span className="dot dot-g"></span>
                </div>
                <div className="window-title">
                  guest@leonpupier.fr — /home/leon — tty1
                </div>
                <div className="window-meta">
                  {tweaks.sound ? "♪ on" : "♪ off"}
                </div>
              </div>

              <div className="window-body" ref={scrollRef}>
                {lines.map((line, i) => (
                  <OutputLine key={i} line={line} onBannerDone={onBannerDone} onCopy={onLinkCopy} onSnakeExit={onSnakeExit} />
                ))}

                {booted && (
                  <form onSubmit={onSubmit} className="t-input-row">
                    <span className="t-prompt">{PROMPT}</span>
                    <span className="t-input-wrap">
                      <input
                        ref={inputRef}
                        className="t-input"
                        value={input}
                        onChange={e => {
                          setInput(e.target.value);
                          // Freeze cursor blink during typing — pause then resume after idle
                          setTyping(true);
                          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
                          typingTimerRef.current = setTimeout(() => setTyping(false), 500);
                        }}
                        onKeyDown={onKeyDown}
                        onKeyUp={updateCaret}
                        onClick={updateCaret}
                        onSelect={updateCaret}
                        onFocus={() => {
                          setFocused(true);
                          updateCaret();
                          if (tweaksRef.current.sound && !focusedOnceRef.current) {
                            focusedOnceRef.current = true;
                            playFocus(0.05);
                          } else if (tweaksRef.current.sound) {
                            // softer re-focus chirp
                            playFocus(0.035);
                          }
                        }}
                        onBlur={() => setFocused(false)}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        aria-label="terminal input"
                      />
                      <span
                        ref={measureRef}
                        className="t-input-measure"
                        aria-hidden="true"
                      />
                      {ghost && (
                        <span className="t-ghost" aria-hidden="true">
                          {input}<span className="t-ghost-suffix">{ghost}</span>
                        </span>
                      )}
                      <span
                        className={`t-cursor ${focused ? "active" : ""} ${typing ? "typing" : ""}`}
                        style={{ left: caretPos + "px" }}
                      >█</span>
                    </span>
                  </form>
                )}
              </div>

              <div className="window-footer">
                <span className="t-muted">
                  ↑/↓ history · TAB complete · → accept · CTRL+L clear · chain && or ; · type `help`
                </span>
              </div>
            </div>
          </div>

          {closeStage === 2 && (
            <div className="close-error-overlay" onClick={(e) => e.stopPropagation()}>
              <div className="close-error-dialog" role="alertdialog">
                <div className="close-error-titlebar">
                  <span className="close-error-icon">⚠</span>
                  <span>Cannot exit terminal</span>
                </div>
                <div className="close-error-body">
                  <div className="close-error-msg">
                    <strong>ERROR 0xC0DEBA5E</strong>
                    <span>The process <code>leon.exe</code> is currently running.</span>
                    <span>Operation cannot be completed because the user is too curious.</span>
                  </div>
                  <div className="close-error-trace">
                    <div>at simulation/main.js:42:13</div>
                    <div>at curiosity_loop (matrix.so:1024:7)</div>
                    <div>at human::escape (host.tty:0xff)</div>
                  </div>
                </div>
                <div className="close-error-actions">
                  <button className="close-error-btn primary">OK</button>
                  <button className="close-error-btn">Cancel</button>
                  <button className="close-error-btn">Definitely Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="crt-burn" aria-hidden="true"></div>
          <div className="crt-vignette" aria-hidden="true"></div>
          <div className="crt-scanlines" aria-hidden="true"></div>
          <div className="crt-flicker" aria-hidden="true"></div>
          <div className="crt-glass" aria-hidden="true"></div>
        </div>
      </div>

      {copyToast && <div className="copy-toast">{copyToast}</div>}
      {showMatrix && <MatrixRain onClose={() => setShowMatrix(false)} />}
      {closeStage === 4 && (
        <div className="close-escape-overlay" aria-hidden="true">
          <div className="close-escape-text">
            <div>$ kill -9 $$</div>
            <div>kill: not permitted</div>
            <div>$ exit</div>
            <div>exit: trapped in simulation</div>
            <div>$ <span className="close-escape-blink">_</span></div>
          </div>
        </div>
      )}
    </>
  );
}

window.Terminal = Terminal;
