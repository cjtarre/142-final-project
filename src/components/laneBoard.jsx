import { ShoppingCart } from "lucide-react";
import LaneCard from "./LaneCard";
import { computeUtilizations } from "../utils/metrics";

function LaneBoard({ lanes, onSpeedChange, onRemoveLaneCustomer, onMoveLaneCustomer, onReorderLaneCustomer }) {
  const utilizationMap = computeUtilizations(lanes);
  return (
    <section className="lane-board">
      <div className="lane-board-header">
        <div className="section-title">
          <ShoppingCart size={18} />
          <h2>Lane Status</h2>
        </div>
      </div>

      <div className="lane-grid">
        {lanes.map((lane) => (
          <LaneCard
            key={lane.id}
            lane={lane}
            utilization={utilizationMap[lane.id]}
            onSpeedChange={onSpeedChange}
            onRemoveLaneCustomer={onRemoveLaneCustomer}
            onMoveLaneCustomer={onMoveLaneCustomer}
            onReorderLaneCustomer={onReorderLaneCustomer}
          />
        ))}
      </div>
    </section>
  );
}

export default LaneBoard;