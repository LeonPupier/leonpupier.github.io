// Matrix rain overlay — temporary fullscreen effect

function MatrixRain({ onClose }) {
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w, h, cols, drops, fontSize;
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789{}[]<>/\\$#@&%*+";
    const charArr = chars.split("");

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      fontSize = 16;
      cols = Math.floor(w / fontSize);
      drops = Array(cols).fill(0).map(() => Math.random() * -50);
    }
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      ctx.fillStyle = "rgba(8, 14, 8, 0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#00ff66";
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = charArr[Math.floor(Math.random() * charArr.length)];
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      rafRef.current = requestAnimationFrame(frame);
    }
    frame();

    const t = setTimeout(onClose, 4500);
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(t);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="matrix-overlay" onClick={onClose}>
      <canvas ref={canvasRef} />
      <div className="matrix-hint">click or press ESC to exit · auto-closes in 4s</div>
    </div>
  );
}

window.MatrixRain = MatrixRain;
