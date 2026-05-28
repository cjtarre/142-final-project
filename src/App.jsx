import { useState } from "react";
import "./App.css";

import Header from "./components/Header";
import ControlPanel from "./components/ControlPanel";
import LaneBoard from "./components/LaneBoard";
import ComparisonTable from "./components/ComparisonTable";

import {
  workloadMinutesForLane,
  pickShortestLineByCount,
  pickEFTLane,
  computeUtilizations,
  averageWait,
  approximateTotalIdleTime,
} from "./utils/metrics";

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
  const [algorithm, setAlgorithm] = useState("eft");
  const [timeSaved, setTimeSaved] = useState(0);
  const [totalWaitShortest, setTotalWaitShortest] = useState(0);
  const [totalWaitEFT, setTotalWaitEFT] = useState(0);
  const [totalAssignedCount, setTotalAssignedCount] = useState(0);

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

    const shortest = pickShortestLineByCount(lanes);
    const eft = pickEFTLane(lanes, Number(customerItems));

    const waitShortest = workloadMinutesForLane(shortest);
    const waitEFT = workloadMinutesForLane(eft);
    const saved = Math.max(0, waitShortest - waitEFT);

    setTimeSaved((s) => +(s + saved).toFixed(2));
    setTotalWaitShortest((t) => t + waitShortest);
    setTotalWaitEFT((t) => t + waitEFT);
    setTotalAssignedCount((c) => c + 1);

    // decide which lane to mutate based on selected algorithm
    const assignLane = algorithm === "shortest" ? shortest : eft || shortest;

    const updatedLanes = lanes.map((lane) => {
      if (lane.id === assignLane.id) {
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
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          timeSaved={timeSaved}
        />

        <div className="content-area">
          <LaneBoard
            lanes={lanes}
            status={status}
            iteration={iteration}
            utilizationMap={computeUtilizations(lanes)}
          />

          <ComparisonTable
            avgWaitShortest={averageWait(totalWaitShortest, totalAssignedCount)}
            avgWaitEFT={averageWait(totalWaitEFT, totalAssignedCount)}
            improvement={
              averageWait(totalWaitShortest, totalAssignedCount) -
              averageWait(totalWaitEFT, totalAssignedCount)
            }
            totalIdleShortest={approximateTotalIdleTime(lanes, computeUtilizations(lanes))}
            totalIdleEFT={approximateTotalIdleTime(lanes, computeUtilizations(lanes))}
          />
        </div>
      </main>
    </div>
  );
}

export default App;