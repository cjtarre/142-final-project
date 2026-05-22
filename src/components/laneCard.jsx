function LaneCard({ lane }) {
  return (
    <div className={`lane-card ${lane.selected ? "selected-lane" : ""}`}>
      <h3>
        LANE {lane.id}
        {lane.selected && " (Selected)"}
      </h3>

      <p className="lane-speed">
        Speed: {lane.speed} items/min
      </p>

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