import { useState } from "react";
import "./App.css";

import Header from "./components/Header";
import ControlPanel from "./components/controlPanel";
import LaneBoard from "./components/LaneBoard";
import ComparisonTable from "./components/ComparisonTable";

import { assignCustomersEFT } from "./algorithms/eftGreedy";
import { assignCustomerSLF } from "./algorithms/shortestLineFirst";
import {
  createLane,
  createLanes,
  withLaneSpeed,
  calculateLaneNextAvailable,
} from "./models/lane";
import {
  createPendingCustomerDraft,
  createPendingCustomer,
  updatePendingCustomerDraft,
  updatePendingCustomer as updatePendingCustomerModel,
  togglePendingCustomerMinimized,
  createLaneCustomer,
} from "./models/customer";
import { enqueue, moveItem, updateItem, removeItem } from "./models/queue";
import { generateMetricsReport, compareMetrics } from "./utils/metrics";

const DEMO_CASES = {
  improvement: {
    label: "Demo: EFT Improvement",
    lanes: [
      { id: 1, speed: 1 },
      { id: 2, speed: 2 },
      { id: 3, speed: 4 },
    ],
    customers: [
      { name: "Customer A", items: 8 },
      { name: "Customer B", items: 4 },
      { name: "Customer C", items: 6 },
      { name: "Customer D", items: 2 },
    ],
  },

  equalSpeeds: {
    label: "Test: Equal Speeds",
    lanes: [
      { id: 1, speed: 3 },
      { id: 2, speed: 3 },
      { id: 3, speed: 3 },
    ],
    customers: [
      { name: "Customer A", items: 6 },
      { name: "Customer B", items: 6 },
      { name: "Customer C", items: 6 },
    ],
  },

  slowCashier: {
    label: "Slow Cashier Bottleneck",
    lanes: [
      { id: 1, speed: 1 },
      { id: 2, speed: 5 },
      { id: 3, speed: 5 },
    ],
    customers: [
      { name: "Customer A", items: 10 },
      { name: "Customer B", items: 8 },
      { name: "Customer C", items: 7 },
      { name: "Customer D", items: 3 },
    ],
  },

  singleLane: {
    label: "Single Lane",
    lanes: [{ id: 1, speed: 2 }],
    customers: [
      { name: "Customer A", items: 5 },
      { name: "Customer B", items: 3 },
      { name: "Customer C", items: 4 },
    ],
  },
};

function App() {
  const [numberOfLanes, setNumberOfLanes] = useState(3);
  const [lanes, setLanes] = useState(createLanes(3));
  const [customerId, setCustomerId] = useState(1);
  const [customerDraft, setCustomerDraft] = useState(createPendingCustomerDraft(1));
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [iteration, setIteration] = useState(0);
  const [timeSaved, setTimeSaved] = useState(0);
  const [metricsEFT, setMetricsEFT] = useState(null);
  const [metricsSLF, setMetricsSLF] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [selectedDemo, setSelectedDemo] = useState("improvement");

  // Runs one simulation step
  function handleStart() {
    setLanes((prevLanes) => {
      const assignedLanes = assignPendingCustomersToLanes(prevLanes, pendingCustomers);
      const processedLanes = processLaneIteration(assignedLanes);

      const metricsEFTReport = generateMetricsReport(processedLanes);
      setMetricsEFT(metricsEFTReport);

      const lanesWithSLF = assignPendingCustomersToLanesWithSLF(
        prevLanes,
        pendingCustomers
      );
      const processedLanesSLF = processLaneIteration(lanesWithSLF);
      const metricsSLFReport = generateMetricsReport(processedLanesSLF);
      setMetricsSLF(metricsSLFReport);

      const comp = compareMetrics(metricsSLFReport, metricsEFTReport);
      setComparison(comp);

      const savedTime = Math.max(
        0,
        metricsSLFReport.makespan - metricsEFTReport.makespan
      );
      setTimeSaved(Number(savedTime.toFixed(2)));

      return processedLanes;
    });

    if (pendingCustomers.length > 0) setPendingCustomers([]);

    setCustomerDraft(createPendingCustomerDraft(customerId));
    setIteration((prev) => prev + 1);
  }

  // Resets all simulator state
  function handleReset() {
    setNumberOfLanes(3);
    setLanes(createLanes(3));
    setCustomerId(1);
    setCustomerDraft(createPendingCustomerDraft(1));
    setPendingCustomers([]);
    setIteration(0);
    setTimeSaved(0);
    setMetricsEFT(null);
    setMetricsSLF(null);
    setComparison(null);
    setSelectedDemo("improvement");
  }

  // Loads selected test case
  function loadDemoData() {
    const testCase = DEMO_CASES[selectedDemo];

    setNumberOfLanes(testCase.lanes.length);
    setLanes(testCase.lanes.map((lane) => createLane(lane.id, lane.speed)));

    setPendingCustomers(
      testCase.customers.map((customer, index) => ({
        tempId: `demo-${selectedDemo}-${index + 1}`,
        name: customer.name,
        items: customer.items,
        minimized: true,
      }))
    );

    const nextId = testCase.customers.length + 1;
    setCustomerId(nextId);
    setCustomerDraft(createPendingCustomerDraft(nextId));
    setMetricsEFT(null);
    setMetricsSLF(null);
    setComparison(null);
    setTimeSaved(0);
    setIteration(0);
  }

  // Updates lane count and adds/removes lanes
  function handleLaneCountChange(count) {
    setNumberOfLanes(count);

    setLanes((prevLanes) => {
      if (count > prevLanes.length) {
        const laneDiff = count - prevLanes.length;
        const additionalLanes = Array.from({ length: laneDiff }, (_, index) =>
          createLane(prevLanes.length + index + 1)
        );

        return [...prevLanes, ...additionalLanes];
      }

      return prevLanes.slice(0, count);
    });
  }

  // Updates cashier speed for one lane
  function handleSpeedChange(laneId, value) {
    setLanes((prevLanes) =>
      prevLanes.map((lane) =>
        lane.id === laneId ? withLaneSpeed(lane, value) : lane
      )
    );
  }

  // Updates the staged customer form
  function handleChangeCustomerDraft(field, value) {
    setCustomerDraft((prev) => updatePendingCustomerDraft(prev, field, value));
  }

  // Adds the current draft customer to the pending queue
  function stageCustomer() {
    if (!customerDraft.items || Number(customerDraft.items) <= 0) {
      alert("Please enter a valid number of customer items.");
      return false;
    }

    const newCustomer = createPendingCustomer({
      name: customerDraft.name,
      items: customerDraft.items,
      customerId,
    });

    setPendingCustomers((prev) =>
      enqueue(
        prev.map((customer) => togglePendingCustomerMinimized(customer, true)),
        newCustomer
      )
    );

    setCustomerId((prev) => prev + 1);
    setCustomerDraft(createPendingCustomerDraft(customerId + 1));
    return true;
  }

  // Updates a staged customer
  function updatePendingCustomer(tempId, field, value) {
    setPendingCustomers((prev) =>
      updateItem(prev, tempId, (customer) =>
        updatePendingCustomerModel(customer, field, value)
      )
    );
  }

  // Removes a staged customer
  function removePendingCustomer(tempId) {
    setPendingCustomers((prev) => removeItem(prev, tempId));
  }

  // Moves a staged customer up or down
  function movePendingCustomer(tempId, direction) {
    setPendingCustomers((prev) => {
      const index = prev.findIndex((customer) => customer.tempId === tempId);
      if (index === -1) return prev;

      return moveItem(prev, index, direction);
    });
  }

  // Expands/collapses selected staged customer
  function selectPendingCustomer(tempId) {
    setPendingCustomers((prev) =>
      prev.map((customer) =>
        customer.tempId === tempId
          ? togglePendingCustomerMinimized(customer, !customer.minimized)
          : customer
      )
    );
  }

  // Assigns pending customers using EFT Greedy
  function assignPendingCustomersToLanes(prevLanes, stagedCustomers) {
    if (stagedCustomers.length === 0) return prevLanes;

    let nextId = customerId;

    const lanesWithoutOrderLabels = prevLanes.map((lane) => ({
      ...lane,
      customers: lane.customers.map((customer) => ({
        ...customer,
        showOrder: false,
      })),
    }));

    const laneCustomers = stagedCustomers.map((pending, index) =>
      createLaneCustomer({
        id: nextId++,
        name: pending.name,
        items: pending.items,
        order: index + 1,
      })
    );

    return assignCustomersEFT(lanesWithoutOrderLabels, laneCustomers);
  }

  // Assigns pending customers using Shortest Line First
  function assignPendingCustomersToLanesWithSLF(prevLanes, stagedCustomers) {
    if (stagedCustomers.length === 0) return prevLanes;

    let nextId = customerId;

    const lanesWithoutOrderLabels = prevLanes.map((lane) => ({
      ...lane,
      customers: lane.customers.map((customer) => ({
        ...customer,
        showOrder: false,
      })),
    }));

    return stagedCustomers.reduce((currentLanes, pending, index) => {
      const newCustomer = createLaneCustomer({
        id: nextId++,
        name: pending.name,
        items: pending.items,
        order: index + 1,
      });

      return assignCustomerSLF(currentLanes, newCustomer);
    }, lanesWithoutOrderLabels);
  }

  // Processes one service cycle for all lanes
  function processLaneIteration(lanesToProcess) {
    return lanesToProcess.map((lane) => {
      let remainingCapacity = Number(lane.speed) || 1;

      const nextCustomers = lane.customers
        .filter((customer) => !customer.processed)
        .map((customer) => {
          const totalItems = customer.totalItems ?? customer.items;
          const processedItems = customer.processedItems ?? 0;

          if (remainingCapacity <= 0) {
            return { ...customer, active: false };
          }

          if (customer.items <= remainingCapacity) {
            remainingCapacity -= customer.items;

            return {
              ...customer,
              totalItems,
              processedItems: totalItems,
              processed: true,
              active: false,
            };
          }

          const itemsConsumed = remainingCapacity;
          const remainingItems = Number(
            (customer.items - itemsConsumed).toFixed(2)
          );
          remainingCapacity = 0;

          return {
            ...customer,
            items: remainingItems,
            totalItems,
            processedItems: processedItems + itemsConsumed,
            active: true,
            processed: false,
          };
        });

      return {
        ...lane,
        customers: nextCustomers,
        nextAvailable: calculateLaneNextAvailable(lane.speed, nextCustomers),
      };
    });
  }

  // Removes a mutable customer from a lane
  function removeLaneCustomer(laneId, customerId) {
    setLanes((prevLanes) =>
      prevLanes.map((lane) => {
        if (lane.id !== laneId) return lane;

        const targetCustomer = lane.customers.find(
          (customer) => customer.id === customerId
        );

        if (!targetCustomer || targetCustomer.processed || targetCustomer.active) {
          return lane;
        }

        const updatedCustomers = lane.customers.filter(
          (customer) => customer.id !== customerId
        );

        return {
          ...lane,
          customers: updatedCustomers,
          nextAvailable: calculateLaneNextAvailable(lane.speed, updatedCustomers),
        };
      })
    );
  }

  // Moves a mutable customer between lanes
  function moveLaneCustomer(sourceLaneId, customerId, targetLaneId) {
    if (sourceLaneId === targetLaneId) return;

    setLanes((prevLanes) => {
      const sourceLane = prevLanes.find((lane) => lane.id === sourceLaneId);
      const targetLane = prevLanes.find((lane) => lane.id === targetLaneId);

      if (!sourceLane || !targetLane) return prevLanes;

      const customer = sourceLane.customers.find((item) => item.id === customerId);
      if (!customer || customer.processed || customer.active) return prevLanes;

      const updatedSourceCustomers = sourceLane.customers.filter(
        (item) => item.id !== customerId
      );
      const updatedTargetCustomers = [...targetLane.customers, customer];

      return prevLanes.map((lane) => {
        if (lane.id === sourceLaneId) {
          return {
            ...lane,
            customers: updatedSourceCustomers,
            nextAvailable: calculateLaneNextAvailable(
              lane.speed,
              updatedSourceCustomers
            ),
          };
        }

        if (lane.id === targetLaneId) {
          return {
            ...lane,
            customers: updatedTargetCustomers,
            nextAvailable: calculateLaneNextAvailable(
              lane.speed,
              updatedTargetCustomers
            ),
          };
        }

        return lane;
      });
    });
  }

  // Reorders mutable customers inside a lane
  function reorderLaneCustomer(laneId, customerId, direction) {
    setLanes((prevLanes) =>
      prevLanes.map((lane) => {
        if (lane.id !== laneId) return lane;

        const index = lane.customers.findIndex(
          (customer) => customer.id === customerId
        );
        if (index === -1) return lane;

        const customer = lane.customers[index];
        if (customer.processed || customer.active) return lane;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= lane.customers.length) return lane;

        const targetCustomer = lane.customers[targetIndex];
        if (targetCustomer.processed || targetCustomer.active) return lane;

        const nextCustomers = [...lane.customers];

        [nextCustomers[index], nextCustomers[targetIndex]] = [
          nextCustomers[targetIndex],
          nextCustomers[index],
        ];

        return {
          ...lane,
          customers: nextCustomers,
          nextAvailable: calculateLaneNextAvailable(lane.speed, nextCustomers),
        };
      })
    );
  }

  return (
    <div className="app">
      <Header iteration={iteration} onStart={handleStart} onReset={handleReset} />

      <main className="main-layout">
        <ControlPanel
          numberOfLanes={numberOfLanes}
          onSetLaneCount={handleLaneCountChange}
          customerDraft={customerDraft}
          onChangeCustomerDraft={handleChangeCustomerDraft}
          pendingCustomers={pendingCustomers}
          onStageCustomer={stageCustomer}
          onSelectPendingCustomer={selectPendingCustomer}
          onUpdatePendingCustomer={updatePendingCustomer}
          onRemovePendingCustomer={removePendingCustomer}
          onMovePendingCustomer={movePendingCustomer}
          selectedDemo={selectedDemo}
          setSelectedDemo={setSelectedDemo}
          onLoadDemo={loadDemoData}
          timeSaved={timeSaved}
        />

        <div className="content-area">
          <LaneBoard
            lanes={lanes}
            onSpeedChange={handleSpeedChange}
            onRemoveLaneCustomer={removeLaneCustomer}
            onMoveLaneCustomer={moveLaneCustomer}
            onReorderLaneCustomer={reorderLaneCustomer}
          />

          <ComparisonTable
            metricsEFT={metricsEFT}
            metricsSLF={metricsSLF}
            comparison={comparison}
          />
        </div>
      </main>
    </div>
  );
}

export default App;