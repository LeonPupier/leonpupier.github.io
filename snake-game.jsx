// Snake — inline embedded game inside the terminal output stream
const { useRef: snakeUseRef, useEffect: snakeUseEffect, useState: snakeUseState } = React;

function SnakeGame({ onClose }) {
  const canvasRef = snakeUseRef(null);
  const wrapRef = snakeUseRef(null);
  const [score, setScore] = snakeUseState(0);
  const [highScore, setHighScore] = snakeUseState(() => {
    try { return parseInt(localStorage.getItem("snake-hi") || "0", 10); } catch (e) { return 0; }
  });
  const [gameOver, setGameOver] = snakeUseState(false);
  const [exited, setExited] = snakeUseState(false);
  const stateRef = snakeUseRef(null);
  const finalScoreRef = snakeUseRef(0);

  snakeUseEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const COLS = 32;
    const ROWS = 16;
    const CELL = 14;
    canvas.width = COLS * CELL;
    canvas.height = ROWS * CELL;

    const state = {
      snake: [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: { x: 22, y: 8 },
      alive: true,
      tick: 0,
      score: 0,
      stepInterval: 110,
      lastStep: 0,
      raf: null,
    };
    stateRef.current = state;

    function placeFood() {
      while (true) {
        const fx = Math.floor(Math.random() * COLS);
        const fy = Math.floor(Math.random() * ROWS);
        if (!state.snake.some(s => s.x === fx && s.y === fy)) {
          state.food = { x: fx, y: fy };
          return;
        }
      }
    }

    function step() {
      const head = state.snake[0];
      if (
        !(state.nextDir.x === -state.dir.x && state.nextDir.y === -state.dir.y) ||
        state.snake.length === 1
      ) {
        state.dir = state.nextDir;
      }
      const nx = head.x + state.dir.x;
      const ny = head.y + state.dir.y;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) { die(); return; }
      if (state.snake.some(s => s.x === nx && s.y === ny)) { die(); return; }
      state.snake.unshift({ x: nx, y: ny });
      if (nx === state.food.x && ny === state.food.y) {
        state.score += 1;
        setScore(state.score);
        finalScoreRef.current = state.score;
        if (typeof playBeep === "function") playBeep(0.05, 1200, 0.06);
        state.stepInterval = Math.max(55, state.stepInterval - 2.5);
        placeFood();
      } else {
        state.snake.pop();
      }
    }

    function die() {
      state.alive = false;
      setGameOver(true);
      if (typeof playBeep === "function") {
        playBeep(0.07, 220, 0.16);
        setTimeout(() => playBeep(0.06, 160, 0.2), 130);
      }
      try {
        const prev = parseInt(localStorage.getItem("snake-hi") || "0", 10);
        if (state.score > prev) {
          localStorage.setItem("snake-hi", String(state.score));
          setHighScore(state.score);
        }
      } catch (e) {}
    }

    function draw() {
      ctx.fillStyle = "#020602";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // very subtle grid
      ctx.strokeStyle = "rgba(0, 255, 102, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL + 0.5, 0);
        ctx.lineTo(x * CELL + 0.5, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL + 0.5);
        ctx.lineTo(canvas.width, y * CELL + 0.5);
        ctx.stroke();
      }

      // food
      const pulse = 0.5 + 0.5 * Math.sin(state.tick / 6);
      ctx.fillStyle = `rgba(255, 207, 58, ${0.7 + 0.3 * pulse})`;
      ctx.shadowColor = "#ffcf3a";
      ctx.shadowBlur = 8 + 4 * pulse;
      ctx.fillRect(state.food.x * CELL + 3, state.food.y * CELL + 3, CELL - 6, CELL - 6);
      ctx.shadowBlur = 0;

      // snake
      state.snake.forEach((seg, i) => {
        const isHead = i === 0;
        const alpha = isHead ? 1 : Math.max(0.3, 1 - i / state.snake.length);
        ctx.fillStyle = isHead ? "#9efbb3" : `rgba(0, 255, 102, ${alpha})`;
        ctx.shadowColor = "#00ff66";
        ctx.shadowBlur = isHead ? 10 : 4;
        ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
      });
      ctx.shadowBlur = 0;

      if (!state.alive) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff5f56";
        ctx.shadowColor = "#ff5f56";
        ctx.shadowBlur = 10;
        ctx.font = "bold 22px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 4);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#6cffaa";
        ctx.font = "11px JetBrains Mono, monospace";
        ctx.fillText("R = restart  ·  ESC = exit", canvas.width / 2, canvas.height / 2 + 16);
      }
    }

    function loop(ts) {
      if (!stateRef.current) return;
      if (!state.lastStep) state.lastStep = ts;
      const elapsed = ts - state.lastStep;
      if (state.alive && elapsed >= state.stepInterval) {
        step();
        state.lastStep = ts;
      }
      state.tick += 1;
      draw();
      state.raf = requestAnimationFrame(loop);
    }
    state.raf = requestAnimationFrame(loop);

    function reset() {
      state.snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
      state.dir = { x: 1, y: 0 };
      state.nextDir = { x: 1, y: 0 };
      state.alive = true;
      state.score = 0;
      state.stepInterval = 110;
      state.lastStep = 0;
      finalScoreRef.current = 0;
      setScore(0);
      setGameOver(false);
    }

    function exit() {
      cancelAnimationFrame(state.raf);
      stateRef.current = null;
      // Explicitly tear down the key listener — the component stays mounted
      // (parent keeps the snake-inline line in `lines`), so the useEffect
      // cleanup wouldn't fire on its own and the listener would keep
      // swallowing arrows / WASD / R / Esc, breaking those keys in the
      // terminal input afterwards.
      window.removeEventListener("keydown", onKey, true);
      setExited(true);
      if (onClose) onClose(finalScoreRef.current);
    }

    function onKey(e) {
      if (exited) return;
      // Always handle ESC as exit
      if (e.key === "Escape") {
        e.preventDefault();
        exit();
        return;
      }
      if (!state.alive) {
        if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          reset();
        }
        return;
      }
      let nd = null;
      switch (e.key) {
        case "ArrowUp":    case "w": case "W": nd = { x: 0,  y: -1 }; break;
        case "ArrowDown":  case "s": case "S": nd = { x: 0,  y: 1  }; break;
        case "ArrowLeft":  case "a": case "A": nd = { x: -1, y: 0  }; break;
        case "ArrowRight": case "d": case "D": nd = { x: 1,  y: 0  }; break;
      }
      if (nd) {
        e.preventDefault();
        e.stopPropagation();
        state.nextDir = nd;
      }
    }
    // capture phase so the terminal input doesn't see the keys
    window.addEventListener("keydown", onKey, true);

    return () => {
      window.removeEventListener("keydown", onKey, true);
      if (state.raf) cancelAnimationFrame(state.raf);
      stateRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (exited) {
    // Once exited, render nothing — the terminal will print a follow-up line
    return null;
  }

  return (
    <div className="snake-inline" ref={wrapRef}>
      <div className="snake-inline-hud">
        <span className="snake-inline-tag">[ snake ]</span>
        <span className="snake-inline-stat">score <b>{score}</b></span>
        <span className="snake-inline-stat">best <b>{highScore}</b></span>
        <span className="snake-inline-keys">↑↓←→ move · R restart · ESC exit</span>
      </div>
      <canvas ref={canvasRef} className="snake-inline-canvas" />
    </div>
  );
}

window.SnakeGame = SnakeGame;
