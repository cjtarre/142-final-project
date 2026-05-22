import { Settings, UserPlus, Users } from "lucide-react";

function ControlPanel({
  numberOfLanes,
  setNumberOfLanes,
  lanes,
  setLanes,
  customerItems,
  setCustomerItems,
  onAddCustomer,
  createLanes,
}) {
  function handleLaneCountChange(e) {
    const count = Number(e.target.value);
    setNumberOfLanes(count);
    setLanes(createLanes(count));
  }

  function handleSpeedChange(laneId, value) {
    const updatedLanes = lanes.map((lane) => {
      if (lane.id === laneId) {
        return { ...lane, speed: value };
      }

      return lane;
    });

    setLanes(updatedLanes);
  }

  return (
    <aside className="control-panel">
      <div className="section-title">
        <Settings size={18} />
        <h2>Simulation Settings</h2>
      </div>

      <div className="form-group">
        <label>Number of Lanes</label>
        <select value={numberOfLanes} onChange={handleLaneCountChange}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
          <option value={6}>6</option>
        </select>
      </div>

      <h3>Cashier Speeds</h3>

      {lanes.map((lane) => (
        <div className="speed-row" key={lane.id}>
          <span>Lane {lane.id}</span>
          <input
            type="number"
            min="1"
            placeholder="Speed"
            value={lane.speed}
            onChange={(e) => handleSpeedChange(lane.id, e.target.value)}
          />
          <small>items/min</small>
        </div>
      ))}

      <h3>Add Customer</h3>

      <div className="form-group">
        <label>Items</label>
        <input
          type="number"
          min="1"
          placeholder="Enter item count"
          value={customerItems}
          onChange={(e) => setCustomerItems(e.target.value)}
        />
      </div>

      <button className="add-btn" onClick={onAddCustomer}>
        <UserPlus size={16} />
        Add Customer
      </button>

      <div className="logic-box">
        <h3>Algorithm Overview</h3>

        <div className="logic-step">
          <span>1</span>
          <p>Compute the projected finish time for every checkout lane.</p>
        </div>

        <div className="logic-step">
          <span>2</span>
          <p>Select the lane with the earliest completion time.</p>
        </div>

        <div className="logic-step">
          <span>3</span>
          <p>Assign the incoming customer to the chosen lane.</p>
        </div>
      </div>

      <div className="members-box">
        <div className="members-title">
          <Users size={14} />
          <h3>Project Members</h3>
        </div>

        <p>Arellano</p>
        <p>Sumergido</p>
        <p>Tarre</p>
      </div>
    </aside>
  );
}

export default ControlPanel;