import { Play, Pause, RotateCcw } from "lucide-react";

function Header({ status, onStart, onPause, onReset }) {
  return (
    <header className="header">
      <div>
        <h1>Checkout Lanes Optimizer (Simulator)</h1>
        <p className="status-text">Status: {status}</p>
      </div>

      <div className="controls">
        <button className="start-btn" onClick={onStart}>
          <Play size={16} />
          Start
        </button>

        <button className="pause-btn" onClick={onPause}>
          <Pause size={16} />
          Pause
        </button>

        <button className="reset-btn" onClick={onReset}>
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </header>
  );
}

export default Header;