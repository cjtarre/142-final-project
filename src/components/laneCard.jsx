function LaneCard({ lane, utilization = 0 }) {
  const util = Math.max(0, Math.min(1, utilization || 0));
  let utilClass = "util-green";
  if (util >= 0.8) utilClass = "util-red";
  else if (util >= 0.5) utilClass = "util-yellow";

  return (
    <div className={`lane-card ${lane.selected ? "selected-lane" : ""} ${utilClass}`}>
      <h3>
        LANE {lane.id}
        {lane.selected && " (Selected)"}
      </h3>

      <p className="lane-speed">
        Speed: {lane.speed} items/min
      </p>

      <div className="utilization-row">
        <div className="util-bar">
          <div className="util-fill" style={{ width: `${Math.round(util * 100)}%` }} />
        </div>
        <small>{Math.round(util * 100)}%</small>
      </div>

      <div className="customer-list">
        {lane.customers.map((customer) => (
          <div key={customer.id} className="customer-card">
            <p>Cust #{customer.id}</p>
            <span>{customer.items} items</span>
          </div>
        ))}
      </div>

      <div className="eta-box">
        <p>Next Available</p>
        <h4>{lane.nextAvailable} min</h4>
      </div>
    </div>
  );
}

export default LaneCard;