import { useState } from "react";
import "./App.css";

import Header from "./components/Header";
import ControlPanel from "./components/controlPanel";
import LaneBoard from "./components/LaneBoard";
import ComparisonTable from "./components/ComparisonTable";
import { assignCustomerEFT } from "./algorithms/eftGreedy";
import { assignCustomerSLF } from "./algorithms/shortestLineFirst";
import { createLane, createLanes, withLaneSpeed, calculateLaneNextAvailable } from "./models/lane";
import { createPendingCustomerDraft, createPendingCustomer, updatePendingCustomerDraft, 
          updatePendingCustomer as updatePendingCustomerModel, togglePendingCustomerMinimized, createLaneCustomer } from "./models/customer";
import { enqueue, moveItem, updateItem, removeItem } from "./models/queue";
import { generateMetricsReport, compareMetrics, computeUtilizations } from "./utils/metrics";

function App() {
  const [numberOfLanes, setNumberOfLanes] = useState(3);
  const [lanes, setLanes] = useState(createLanes(3));
  const [customerId, setCustomerId] = useState(1);
  const [customerDraft, setCustomerDraft] = useState(createPendingCustomerDraft(1));
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [status, setStatus] = useState("idle");
  const [iteration, setIteration] = useState(0);
  const [algorithm, setAlgorithm] = useState("eft");
  const [metricsEFT, setMetricsEFT] = useState(null);
  const [metricsSLF, setMetricsSLF] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [timeSaved, setTimeSaved] = useState(0);

  function handleStart() {
    setLanes((prevLanes) => {
      const selectedLanes = assignPendingCustomersToLanes(prevLanes, pendingCustomers);
      const processedSelectedLanes = processLaneIteration(selectedLanes);
      const selectedMetrics = generateMetricsReport(processedSelectedLanes);

      const baselineLanes = algorithm === "eft"
        ? assignPendingCustomersToLanesWithSLF(prevLanes, pendingCustomers)
        : assignPendingCustomersToLanesWithEFT(prevLanes, pendingCustomers);
      const processedBaselineLanes = processLaneIteration(baselineLanes);
      const baselineMetrics = generateMetricsReport(processedBaselineLanes);

      if (algorithm === "eft") {
        setMetricsEFT(selectedMetrics);
        setMetricsSLF(baselineMetrics);
        const saved = Math.max(0, Number((baselineMetrics.makespan - selectedMetrics.makespan).toFixed(2)));
        setTimeSaved(saved);
      } else {
        setMetricsSLF(selectedMetrics);
        setMetricsEFT(baselineMetrics);
        setTimeSaved(0);
      }

      const comp = algorithm === "eft"
        ? compareMetrics(baselineMetrics, selectedMetrics)
        : compareMetrics(baselineMetrics, selectedMetrics);
      setComparison(comp);

      return processedSelectedLanes;
    });

    if (pendingCustomers.length > 0) {
      setPendingCustomers([]);
    }

    setCustomerDraft(createPendingCustomerDraft(customerId));
    setIteration((prev) => prev + 1);
    setStatus("running");
  }

  function handleReset() {
    setNumberOfLanes(3);
    setLanes(createLanes(3));
    setCustomerId(1);
    setCustomerDraft(createPendingCustomerDraft(1));
    setPendingCustomers([]);
    setStatus("idle");
    setIteration(0);
    setMetricsEFT(null);
    setMetricsSLF(null);
    setComparison(null);
    setTimeSaved(0);
  }

  function handleLaneCountChange(count) {
    setNumberOfLanes(count);
    setLanes((prevLanes) => {
      if (count > prevLanes.length) {
        const laneDiff = count - prevLanes.length;
        const additionalLanes = Array.from({ length: laneDiff }, (_, index) => createLane(prevLanes.length + index + 1));
        return [...prevLanes, ...additionalLanes];
      }
      return prevLanes.slice(0, count);
    });
  }

  function handleSpeedChange(laneId, value) {
    setLanes((prevLanes) =>
      prevLanes.map((lane) => (lane.id === laneId ? withLaneSpeed(lane, value) : lane))
    );
  }

  function handleChangeCustomerDraft(field, value) {
    setCustomerDraft((prev) => updatePendingCustomerDraft(prev, field, value));
  }

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
      enqueue(prev.map((customer) => togglePendingCustomerMinimized(customer, true)), newCustomer)
    );
    setCustomerId((prev) => prev + 1);
    setCustomerDraft(createPendingCustomerDraft(customerId + 1));
    return true;
  }

  function assignPendingCustomersToLanes(prevLanes, stagedCustomers) {
    if (stagedCustomers.length === 0) {
      return prevLanes;
    }

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

      return algorithm === "eft"
        ? assignCustomerEFT(currentLanes, newCustomer)
        : assignCustomerSLF(currentLanes, newCustomer);
    }, lanesWithoutOrderLabels);
  }

  function assignPendingCustomersToLanesWithEFT(prevLanes, stagedCustomers) {
    if (stagedCustomers.length === 0) {
      return prevLanes;
    }

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

      return assignCustomerEFT(currentLanes, newCustomer);
    }, lanesWithoutOrderLabels);
  }

  function updatePendingCustomer(tempId, field, value) {
    setPendingCustomers((prev) =>
      updateItem(prev, tempId, (customer) => updatePendingCustomerModel(customer, field, value))
    );
  }

  function removePendingCustomer(tempId) {
    setPendingCustomers((prev) => removeItem(prev, tempId));
  }

  function movePendingCustomer(tempId, direction) {
    setPendingCustomers((prev) => {
      const index = prev.findIndex((customer) => customer.tempId === tempId);
      if (index === -1) return prev;
      return moveItem(prev, index, direction);
    });
  }

  function selectPendingCustomer(tempId) {
    setPendingCustomers((prev) =>
      prev.map((customer) =>
        customer.tempId === tempId
          ? togglePendingCustomerMinimized(customer, !customer.minimized)
          : customer
      )
    );
  }

  function assignPendingCustomersToLanes(prevLanes, stagedCustomers) {
    if (stagedCustomers.length === 0) {
      return prevLanes;
    }

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

      return assignCustomerEFT(currentLanes, newCustomer);
    }, lanesWithoutOrderLabels);
  }

  function assignPendingCustomersToLanesWithSLF(prevLanes, stagedCustomers) {
    if (stagedCustomers.length === 0) {
      return prevLanes;
    }

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
          const remainingItems = Number((customer.items - itemsConsumed).toFixed(2));
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

  function removeLaneCustomer(laneId, customerId) {
    setLanes((prevLanes) =>
      prevLanes.map((lane) => {
        if (lane.id !== laneId) {
          return lane;
        }

        const targetCustomer = lane.customers.find((customer) => customer.id === customerId);
        if (!targetCustomer || targetCustomer.processed || targetCustomer.active) {
          return lane;
        }

        const updatedCustomers = lane.customers.filter((customer) => customer.id !== customerId);
        return {
          ...lane,
          customers: updatedCustomers,
          nextAvailable: calculateLaneNextAvailable(lane.speed, updatedCustomers),
        };
      })
    );
  }

  function moveLaneCustomer(sourceLaneId, customerId, targetLaneId) {
    if (sourceLaneId === targetLaneId) {
      return;
    }

    setLanes((prevLanes) => {
      const sourceLane = prevLanes.find((lane) => lane.id === sourceLaneId);
      const targetLane = prevLanes.find((lane) => lane.id === targetLaneId);
      if (!sourceLane || !targetLane) {
        return prevLanes;
      }

      const customer = sourceLane.customers.find((item) => item.id === customerId);
      if (!customer || customer.processed || customer.active) {
        return prevLanes;
      }

      const updatedSourceCustomers = sourceLane.customers.filter((item) => item.id !== customerId);
      const updatedTargetCustomers = [...targetLane.customers, customer];

      return prevLanes.map((lane) => {
        if (lane.id === sourceLaneId) {
          return {
            ...lane,
            customers: updatedSourceCustomers,
            nextAvailable: calculateLaneNextAvailable(lane.speed, updatedSourceCustomers),
          };
        }

        if (lane.id === targetLaneId) {
          return {
            ...lane,
            customers: updatedTargetCustomers,
            nextAvailable: calculateLaneNextAvailable(lane.speed, updatedTargetCustomers),
          };
        }

        return lane;
      });
    });
  }

  function reorderLaneCustomer(laneId, customerId, direction) {
    setLanes((prevLanes) =>
      prevLanes.map((lane) => {
        if (lane.id !== laneId) {
          return lane;
        }

        const index = lane.customers.findIndex((customer) => customer.id === customerId);
        if (index === -1) return lane;

        const customer = lane.customers[index];
        if (customer.processed || customer.active) return lane;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= lane.customers.length) return lane;

        const targetCustomer = lane.customers[targetIndex];
        if (targetCustomer.processed || targetCustomer.active) return lane;

        const nextCustomers = [...lane.customers];
        [nextCustomers[index], nextCustomers[targetIndex]] = [nextCustomers[targetIndex], nextCustomers[index]];
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
      <Header
        iteration={iteration}
        onStart={handleStart}
        onReset={handleReset}
      />

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
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          timeSaved={timeSaved}
        />

        <div className="content-area">
          <LaneBoard
            lanes={lanes}
            status={status}
            utilizationMap={computeUtilizations(lanes)}
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