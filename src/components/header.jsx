import { Play, Info, RotateCcw } from "lucide-react";

function Header({ iteration, onStart, onReset }) {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-title-row">
          <h1>Checkout Lanes Optimizer</h1>
          <div className="header-info" tabIndex="0">
            <Info size={16} />
            <div className="header-tooltip">
              <h4>Algorithm Overview</h4>
              <ol>
                <li>Compute projected finish time for every checkout lane.</li>
                <li>Select the lane with the earliest completion time.</li>
                <li>Assign the incoming customer to the chosen lane.</li>
              </ol>
            </div>
          </div>
        </div>
        <p className="iteration-text">Iteration: {iteration}</p>
      </div>

      <div className="controls">
        <button className="start-btn" onClick={onStart}>
          <Play size={16} />
          Simulate
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