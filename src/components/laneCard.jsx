function LaneCard({ lane, onSpeedChange, onRemoveLaneCustomer, onMoveLaneCustomer, onReorderLaneCustomer }) {
  function handleDrop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      if (parsed.sourceLaneId && parsed.customerId) {
        onMoveLaneCustomer(parsed.sourceLaneId, parsed.customerId, lane.id);
      }
    } catch (error) {
      // ignore invalid drag data
    }
  }

  return (
    <div
      className={`lane-card ${lane.selected ? "selected-lane" : ""}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="lane-card-header-row">
        <h3>
          LANE {lane.id}
          {lane.selected && " (Selected)"}
        </h3>

        <div className="lane-meta">
          <span className="lane-next">Next: {lane.nextAvailable} min</span>
          <div className="lane-speed">
            <label htmlFor={`speed-${lane.id}`}>Speed</label>
            <input
              id={`speed-${lane.id}`}
              type="number"
              min="1"
              max="999"
              value={lane.speed}
              onChange={(e) => onSpeedChange(lane.id, e.target.value)}
            />
            <small>items/min</small>
          </div>
        </div>
      </div>

      <div className="customer-list">
        {lane.customers.map((customer, index) => (
          <div
            key={customer.id}
            className={`customer-card ${customer.processed ? "processed" : customer.active ? "processing" : "draggable"}`}
            draggable={!customer.processed && !customer.active}
            onDragStart={(event) => {
              if (customer.processed || customer.active) return;
              event.dataTransfer.setData(
                "text/plain",
                JSON.stringify({ sourceLaneId: lane.id, customerId: customer.id })
              );
            }}
          >
            <div className="customer-card-header">
              <p>
                {customer.name}
                {customer.showOrder && (
                  <span className="customer-order">#{customer.order}</span>
                )}
              </p>
              <div className="customer-card-actions">
                <button
                  type="button"
                  className="customer-action-btn"
                  onClick={() => onReorderLaneCustomer(lane.id, customer.id, "up")}
                  disabled={index === 0 || customer.processed || customer.active || lane.customers[index - 1]?.processed || lane.customers[index - 1]?.active}
                  title="Move left"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="customer-action-btn"
                  onClick={() => onReorderLaneCustomer(lane.id, customer.id, "down")}
                  disabled={index === lane.customers.length - 1 || customer.processed || customer.active || lane.customers[index + 1]?.processed || lane.customers[index + 1]?.active}
                  title="Move right"
                >
                  →
                </button>
                {!customer.processed && !customer.active && (
                  <button
                    type="button"
                    className="lane-customer-remove"
                    onClick={() => onRemoveLaneCustomer(lane.id, customer.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <span>{customer.items} items</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default LaneCard;