// AnimatedBanner — character-by-character reveal with glitch passes
// Each line scans in left-to-right; cells glitch through random chars before
// resolving to the real glyph. Takes ~1.2s total.

function AnimatedBanner({ text, onDone, soundOn }) {
  const lines = React.useMemo(() => text.split("\n"), [text]);
  const [frames, setFrames] = React.useState(() => lines.map(l => " ".repeat(l.length)));
  const doneRef = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;
    const GLITCH_CHARS = "▓▒░█▄▀■□◆◇○●╳╲╱─│┃═║▌▐";
    const cellState = lines.map(l => Array(l.length).fill(0)); // 0 = empty, 1..N = glitching, N+1 = settled
    const lineDelay = 70;       // ms between line-start
    const charStep = 12;        // ms between cell advances within a line
    const glitchPasses = 3;     // # of random-char frames before settling

    function rnd() { return GLITCH_CHARS[(Math.random() * GLITCH_CHARS.length) | 0]; }

    function compose() {
      return lines.map((line, i) => {
        let out = "";
        for (let j = 0; j < line.length; j++) {
          const s = cellState[i][j];
          const real = line[j];
          if (real === " ") { out += " "; continue; }
          if (s === 0) out += " ";
          else if (s <= glitchPasses) out += rnd();
          else out += real;
        }
        return out;
      });
    }

    let lineCursor = 0;
    let charCursors = lines.map(() => 0);
    let allDone = false;

    function tickClick() {
      if (soundOn && window.playClick) window.playClick(0.025);
    }

    const interval = setInterval(() => {
      if (cancelled) return;
      // Advance every active line's char cursor
      let advancedAny = false;
      for (let i = 0; i <= lineCursor && i < lines.length; i++) {
        const line = lines[i];
        if (charCursors[i] < line.length) {
          // Advance 2-3 chars per tick for liveliness
          const burst = 2 + ((Math.random() * 2) | 0);
          for (let b = 0; b < burst && charCursors[i] < line.length; b++) {
            cellState[i][charCursors[i]] = 1;
            charCursors[i]++;
            advancedAny = true;
          }
        }
        // Advance glitching cells toward settled
        for (let j = 0; j < line.length; j++) {
          if (cellState[i][j] >= 1 && cellState[i][j] <= glitchPasses) {
            cellState[i][j]++;
          }
        }
      }
      if (advancedAny) tickClick();
      setFrames(compose());

      // Check if all settled
      allDone = lines.every((line, i) =>
        line.split("").every((ch, j) => ch === " " || cellState[i][j] > glitchPasses)
      );
      if (allDone && !doneRef.current) {
        doneRef.current = true;
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, charStep);

    // Stagger line starts
    const lineTimers = [];
    for (let i = 1; i < lines.length; i++) {
      lineTimers.push(setTimeout(() => {
        if (!cancelled) lineCursor = i;
      }, i * lineDelay));
    }

    return () => {
      cancelled = true;
      clearInterval(interval);
      lineTimers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="t-banner-wrap">
      <pre className="t-banner t-banner-anim">{frames.join("\n")}</pre>
      <span className="t-banner-beam" aria-hidden="true"></span>
    </div>
  );
}

window.AnimatedBanner = AnimatedBanner;
