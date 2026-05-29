function LaneCard({
  lane,
  utilization = 0,
  onSpeedChange,
  onRemoveLaneCustomer,
  onMoveLaneCustomer,
  onReorderLaneCustomer,
}) {
  const util = Math.max(0, Math.min(1, utilization || 0));

  let utilClass = "util-green";
  if (util >= 0.8) utilClass = "util-red";
  else if (util >= 0.5) utilClass = "util-yellow";

  function handleDrop(event) {
    event.preventDefault();

    if (!onMoveLaneCustomer) return;

    const data = event.dataTransfer.getData("text/plain");
    if (!data) return;

    try {
      const parsed = JSON.parse(data);

      if (parsed.sourceLaneId && parsed.customerId) {
        onMoveLaneCustomer(parsed.sourceLaneId, parsed.customerId, lane.id);
      }
    } catch {
      return;
    }
  }

  return (
    <div
      className={`lane-card ${lane.selected ? "selected-lane" : ""} ${utilClass}`}
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
          <span className={`lane-utilization-label ${utilClass}`}>{Math.round(util * 100)}%</span>

          <div className="lane-speed">
            <label htmlFor={`speed-${lane.id}`}>Speed</label>
            <input
              id={`speed-${lane.id}`}
              type="number"
              min="1"
              max="999"
              value={lane.speed}
              onChange={(e) => onSpeedChange?.(lane.id, e.target.value)}
            />
            <small>items/min</small>
          </div>
        </div>
      </div>

      <div className="utilization-row">
        <div className="util-bar">
          <div
            className="util-fill"
            style={{ width: `${Math.round(util * 100)}%` }}
          />
        </div>
        <small>{Math.round(util * 100)}%</small>
      </div>

      <div className="customer-list">
        {lane.customers.length === 0 ? (
          <div className="empty-queue">No customers in lane</div>
        ) : (
          lane.customers.map((customer, index) => {
            const totalItemsForCustomer = customer.totalItems ?? 0;
            const processedItemsForCustomer = customer.processedItems ?? 0;
            const customerPercent = totalItemsForCustomer > 0
              ? Math.round(customer.processed ? 100 : (processedItemsForCustomer / totalItemsForCustomer) * 100)
              : 0;

            return (
              <div
                key={customer.id}
                className={`customer-card ${
                  customer.processed
                    ? "processed"
                    : customer.active
                    ? "processing"
                    : "draggable"
                }`}
                draggable={!customer.processed && !customer.active}
                onDragStart={(event) => {
                  if (customer.processed || customer.active) return;

                  event.dataTransfer.setData(
                    "text/plain",
                    JSON.stringify({
                      sourceLaneId: lane.id,
                      customerId: customer.id,
                    })
                  );
                }}
              >
                <div className="customer-card-header">
                  <p>{customer.name}</p>

                  {customer.processed && (
                    <span className="customer-status">Processed</span>
                  )}
                </div>

                <span>{processedItemsForCustomer}/{totalItemsForCustomer} items processed</span>

                <div className="customer-card-progress">
                  <div className="customer-card-progress-bar">
                    <div
                      className="customer-card-progress-fill"
                      style={{ width: `${customerPercent}%` }}
                    />
                  </div>
                  <small>{customerPercent}% done</small>
                </div>

                <div className="customer-card-footer">
                  {!customer.processed && !customer.active ? (
                    <div className="customer-card-controls">
                      <button
                        type="button"
                        className="customer-action-btn"
                        onClick={() =>
                          onReorderLaneCustomer?.(lane.id, customer.id, "up")
                        }
                        disabled={
                          index === 0 ||
                          lane.customers[index - 1]?.processed ||
                          lane.customers[index - 1]?.active
                        }
                        title="Move left"
                      >
                        ←
                      </button>

                      <button
                        type="button"
                        className="customer-action-btn"
                        onClick={() =>
                          onReorderLaneCustomer?.(lane.id, customer.id, "down")
                        }
                        disabled={
                          index === lane.customers.length - 1 ||
                          lane.customers[index + 1]?.processed ||
                          lane.customers[index + 1]?.active
                        }
                        title="Move right"
                      >
                        →
                      </button>

                      <button
                        type="button"
                        className="lane-customer-remove"
                        onClick={() => onRemoveLaneCustomer?.(lane.id, customer.id)}
                      >
                        ×
                      </button>

                      {customer.showOrder && (
                        <span className="customer-order badge-right">#{customer.order}</span>
                      )}
                    </div>
                  ) : (
                    customer.showOrder && (
                      <div className="customer-card-footer">
                        <span className="customer-order badge-right">#{customer.order}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default LaneCard;