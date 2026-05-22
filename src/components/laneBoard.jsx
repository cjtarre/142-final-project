import { ShoppingCart } from "lucide-react";
import LaneCard from "./LaneCard";

function LaneBoard({ lanes, status, iteration }) {
  return (
    <section className="lane-board">
      <div className="lane-board-header">
        <div className="section-title">
          <ShoppingCart size={18} />
          <h2>Lane Status</h2>
        </div>

        <div className="simulation-meta">
          <span className="iteration-badge">
            Iteration: {iteration}
          </span>

          <span className={`status-badge ${status}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="lane-grid">
        {lanes.map((lane) => (
          <LaneCard key={lane.id} lane={lane} />
        ))}
      </div>
    </section>
  );
}

export default LaneBoard;