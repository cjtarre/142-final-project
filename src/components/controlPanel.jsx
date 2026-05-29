import { Settings, UserPlus, Users, ChevronDown, ChevronUp } from "lucide-react";

function ControlPanel({
  numberOfLanes,
  onSetLaneCount,
  customerDraft,
  onChangeCustomerDraft,
  pendingCustomers,
  onStageCustomer,
  onSelectPendingCustomer,
  onUpdatePendingCustomer,
  onRemovePendingCustomer,
  onMovePendingCustomer,
  selectedDemo,
  setSelectedDemo,
  onLoadDemo,
  timeSaved,
}) {
  function handleAddCustomerClick() {
    onStageCustomer();
  }

  return (
    <aside className="control-panel">
      <div className="section-title">
        <Settings size={18} />
        <h2>Simulation Settings</h2>
      </div>

      <div className="form-group inline">
        <label>Number of Lanes</label>
        <input
          type="number"
          min="1"
          max="100"
          className="lane-count-input"
          value={numberOfLanes}
          onChange={(e) => onSetLaneCount(Math.max(1, Number(e.target.value)))}
        />
      </div>

      <div className="demo-section">
        <label className="demo-label">Test Case</label>

        <select
          value={selectedDemo}
          onChange={(e) => setSelectedDemo(e.target.value)}
          className="demo-select"
        >
          <option value="improvement">EFT Improvement</option>
          <option value="equalSpeeds">Equal Speeds</option>
          <option value="slowCashier">Slow Cashier Bottleneck</option>
          <option value="singleLane">Single Lane</option>
        </select>

        <button type="button" className="demo-btn" onClick={onLoadDemo}>
          Load Test Case
        </button>
      </div>

      <div className="customer-input-drawer">
        <button
          className="add-btn drawer-toggle"
          type="button"
          onClick={handleAddCustomerClick}
        >
          <UserPlus size={16} />
          Add Customer
        </button>

        <div className="drawer-content">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Customer name"
              value={customerDraft.name}
              onChange={(e) => onChangeCustomerDraft("name", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Items</label>
            <input
              type="number"
              min="1"
              placeholder="Enter item count"
              value={customerDraft.items}
              onChange={(e) => onChangeCustomerDraft("items", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="pending-list">
        <h3>Staged Customers</h3>

        {pendingCustomers.length === 0 ? (
          <p className="pending-empty">No customer staged yet.</p>
        ) : (
          pendingCustomers.map((customer, index) => (
            <div
              key={customer.tempId}
              className={`pending-card ${
                customer.minimized ? "minimized" : "expanded"
              }`}
            >
              <div className="pending-card-header">
                <button
                  type="button"
                  className={`pending-toggle ${
                    customer.minimized ? "collapsed" : "expanded"
                  }`}
                  onClick={() => onSelectPendingCustomer(customer.tempId)}
                >
                  {customer.minimized ? (
                    <>
                      <ChevronDown size={16} className="toggle-icon" />
                      <span className="customer-name">{customer.name}</span>
                      <span className="customer-items-count">
                        {customer.items} items
                      </span>
                    </>
                  ) : (
                    <>
                      <ChevronUp size={16} className="toggle-icon" />
                      <span className="toggle-label">Edit customer</span>
                    </>
                  )}
                </button>

                <div className="pending-card-actions">
                  <button
                    type="button"
                    className="pending-action-btn"
                    onClick={() => onMovePendingCustomer(customer.tempId, "up")}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    className="pending-action-btn"
                    onClick={() => onMovePendingCustomer(customer.tempId, "down")}
                    disabled={index === pendingCustomers.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    className="pending-action-btn remove-btn"
                    onClick={() => onRemovePendingCustomer(customer.tempId)}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>

              {!customer.minimized && (
                <div className="pending-details">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) =>
                        onUpdatePendingCustomer(
                          customer.tempId,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Items</label>
                    <input
                      type="number"
                      min="1"
                      value={customer.items}
                      onChange={(e) =>
                        onUpdatePendingCustomer(
                          customer.tempId,
                          "items",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="time-saved-box">
        <h3>Time Saved</h3>
        <p className="time-saved-value">{timeSaved} min</p>
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