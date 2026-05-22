import { useState } from "react";
import "./App.css";

import Header from "./components/Header";
import ControlPanel from "./components/ControlPanel";
import LaneBoard from "./components/LaneBoard";
import ComparisonTable from "./components/ComparisonTable";

function createLanes(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    speed: "",
    nextAvailable: "--",
    customers: [],
  }));
}

function App() {
  const [numberOfLanes, setNumberOfLanes] = useState(3);
  const [lanes, setLanes] = useState(createLanes(3));
  const [customerItems, setCustomerItems] = useState("");
  const [status, setStatus] = useState("idle");
  const [customerId, setCustomerId] = useState(1);
  const [iteration, setIteration] = useState(0);

  function handleStart() {
    setStatus("running");
  }

  function handlePause() {
    setStatus("paused");
  }

  function handleReset() {
    setNumberOfLanes(3);
    setLanes(createLanes(3));
    setCustomerItems("");
    setStatus("idle");
    setCustomerId(1);
    setIteration(0);
  }

  function handleAddCustomer() {
    if (!customerItems || Number(customerItems) <= 0) {
      alert("Please enter a valid number of customer items.");
      return;
    }

    const missingSpeeds = lanes.some(
      (lane) => !lane.speed || Number(lane.speed) <= 0
    );

    if (missingSpeeds) {
      alert("Please enter valid cashier speeds for all lanes.");
      return;
    }

    let targetLane = lanes[0];

    for (const lane of lanes) {
      if (lane.customers.length < targetLane.customers.length) {
        targetLane = lane;
      }
    }

    const updatedLanes = lanes.map((lane) => {
      if (lane.id === targetLane.id) {
        return {
          ...lane,
          customers: [
            ...lane.customers,
            {
              id: customerId,
              items: Number(customerItems),
            },
          ],
        };
      }

      return lane;
    });

    setLanes(updatedLanes);
    setCustomerId((prev) => prev + 1);
    setIteration((prev) => prev + 1);
    setCustomerItems("");
  }

  return (
    <div className="app">
      <Header
        status={status}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
      />

      <main className="main-layout">
        <ControlPanel
          numberOfLanes={numberOfLanes}
          setNumberOfLanes={setNumberOfLanes}
          lanes={lanes}
          setLanes={setLanes}
          customerItems={customerItems}
          setCustomerItems={setCustomerItems}
          onAddCustomer={handleAddCustomer}
          createLanes={createLanes}
        />

        <div className="content-area">
          <LaneBoard lanes={lanes} status={status} iteration={iteration} />
          <ComparisonTable />
        </div>
      </main>
    </div>
  );
}

export default App;