// Output renderers for terminal lines

function OutputLine({ line, onBannerDone, onCopy, onSnakeExit }) {
  switch (line.type) {
    case "text":
      return <div className="t-line">{line.text}</div>;
    case "muted":
      return <div className="t-line t-muted">{line.text}</div>;
    case "error":
      return <div className="t-line t-error">{line.text}</div>;
    case "section":
      return <div className="t-line t-section">{line.text}</div>;
    case "spacer":
      return <div className="t-line">&nbsp;</div>;
    case "prompt":
      return (
        <div className="t-line">
          <span className="t-prompt">{line.prompt}</span>
          <span>{line.cmd}</span>
        </div>
      );
    case "kv":
      return (
        <div className="t-line t-kv">
          <span className="t-kv-key">{line.k.padEnd(10, " ")}</span>
          <span className="t-kv-sep">:: </span>
          <span>{line.v}</span>
        </div>
      );
    case "cmdlist":
      return (
        <div className="t-cmdlist">
          {line.items.map(([cmd, desc]) => (
            <div key={cmd} className="t-line">
              <span className="t-cmd">{cmd.padEnd(12, " ")}</span>
              <span className="t-muted">{desc}</span>
            </div>
          ))}
        </div>
      );
    case "catlist":
      return (
        <div className="t-catlist">
          {line.categories.map((cat) => (
            <div key={cat.title} className="t-cat">
              <div className="t-cat-title">┌─ {cat.title} ─┐</div>
              <div className="t-cat-items">
                {cat.items.map(([cmd, desc]) => (
                  <div key={cmd} className="t-cat-item">
                    <span className="t-cat-cmd">{cmd}</span>
                    <span className="t-cat-desc">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case "group":
      return (
        <div className="t-line t-group">
          <span className="t-kv-key">{line.title.padEnd(16, " ")}</span>
          <span className="t-kv-sep">:: </span>
          <span>{line.items.join(" · ")}</span>
        </div>
      );
    case "exp":
      return (
        <div className="t-exp">
          <div className="t-line">
            <span className="t-cmd">▸ {line.role}</span>
            <span className="t-muted"> @ {line.org}</span>
          </div>
          <div className="t-line t-muted t-exp-period">{line.period}</div>
          {line.points.map((p, i) => (
            <div key={i} className="t-line t-exp-point">· {p}</div>
          ))}
        </div>
      );
    case "link":
      return (
        <div className="t-line">
          <span className="t-kv-key">{line.label}</span>
          <span className="t-kv-sep">:: </span>
          <a
            className="t-link"
            href={line.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (onCopy && (e.ctrlKey || e.metaKey || e.shiftKey)) return;
              if (onCopy) onCopy(line.url);
            }}
            title="click to copy · ctrl+click to open"
          >
            {line.display}
          </a>
        </div>
      );
    case "ls":
      return (
        <div className="t-ls">
          {line.items.map(([name, size]) => (
            <div key={name} className="t-line t-ls-row">
              <span className="t-muted">-rw-r--r--</span>
              <span className="t-muted"> guest </span>
              <span className="t-muted">{size.padStart(6, " ")}</span>
              <span> {name}</span>
            </div>
          ))}
        </div>
      );
    case "banner":
      return <pre className="t-banner">{line.text}</pre>;
    case "anim-banner":
      return <AnimatedBanner text={line.text} soundOn={line.soundOn} onDone={onBannerDone} />;
    case "raw":
      return <div className="t-line">{line.text}</div>;
    case "snake-inline":
      return (
        <div className="t-line">
          <SnakeGame onClose={onSnakeExit} />
        </div>
      );
    default:
      return null;
  }
}

window.OutputLine = OutputLine;
