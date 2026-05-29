/**
 * Metrics Engine - Performance Analysis for Lane Assignments
 *
 * Calculates key performance indicators for comparing different lane assignment algorithms:
 * - Makespan: Total time until the last customer finishes
 * - Average Wait Time: Average ETA across all customers
 * - Total Idle Time: Wasted capacity in the system
 * - System Utilization: Percentage of available capacity actually used
 * - Average Queue Length: Mean number of customers in each lane
 */

/**
 * Calculate makespan (total time until all customers are served)
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Makespan value
 */
export function calculateMakespan(lanes) {
  if (lanes.length === 0) return 0;
  return Math.max(...lanes.map((lane) => Number(lane.nextAvailable) || 0));
}

/**
 * Calculate average wait time (ETA) for customers
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Average ETA
 */
export function calculateAverageWaitTime(lanes) {
  const allCustomers = lanes.flatMap((lane) => lane.customers);
  if (allCustomers.length === 0) return 0;

  const totalEta = allCustomers.reduce((sum, customer) => {
    return sum + Number(customer.eta || 0);
  }, 0);

  return totalEta / allCustomers.length;
}

/**
 * Calculate total idle time (wasted capacity)
 * Idle time = (lane.speed × lane.nextAvailable) - sum of customer items
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Total idle time
 */
export function calculateTotalIdleTime(lanes) {
  return lanes.reduce((totalIdle, lane) => {
    const laneTime = Number(lane.nextAvailable) || 0;
    const speed = Number(lane.speed) || 1;

    // Maximum work capacity
    const maxCapacity = speed * laneTime;

    // Actual work done
    const actualWork = lane.customers.reduce((sum, customer) => {
      return sum + Number(customer.items || 0);
    }, 0);

    // Idle time for this lane
    const laneIdleTime = Math.max(0, maxCapacity - actualWork);
    return totalIdle + laneIdleTime;
  }, 0);
}

/**
 * Calculate system utilization percentage
 * Utilization = (Total actual work / Total capacity) × 100
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Utilization percentage
 */
export function calculateUtilization(lanes) {
  if (lanes.length === 0) return 0;

  const totalWork = lanes.reduce((sum, lane) => {
    return sum + lane.customers.reduce(
      (customerSum, customer) =>
        customerSum + Number(customer.items || 0),
      0
    );
  }, 0);

  const makespan = calculateMakespan(lanes);

  const totalCapacity = lanes.reduce((sum, lane) => {
    return sum + (Number(lane.speed) || 1) * makespan;
  }, 0);

  if (totalCapacity === 0) return 0;

  return (totalWork / totalCapacity) * 100;
}

/**
 * Calculate average queue length (customers per lane)
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Average number of customers per lane
 */
export function calculateAverageQueueLength(lanes) {
  if (lanes.length === 0) return 0;

  const totalCustomers = lanes.reduce((sum, lane) => {
    return sum + lane.customers.length;
  }, 0);

  return totalCustomers / lanes.length;
}

/**
 * Calculate average service time per customer
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Average service time
 */
export function calculateAverageServiceTime(lanes) {
  const allCustomers = lanes.flatMap((lane) => lane.customers);
  if (allCustomers.length === 0) return 0;

  const totalServiceTime = allCustomers.reduce((sum, customer) => {
    return sum + Number(customer.serviceTime || 0);
  }, 0);

  return totalServiceTime / allCustomers.length;
}

/**
 * Get maximum queue length (longest line)
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Maximum customers in any single lane
 */
export function calculateMaxQueueLength(lanes) {
  if (lanes.length === 0) return 0;
  return Math.max(...lanes.map((lane) => lane.customers.length));
}

/**
 * Get minimum queue length (shortest line)
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Minimum customers in any single lane
 */
export function calculateMinQueueLength(lanes) {
  if (lanes.length === 0) return 0;
  return Math.min(...lanes.map((lane) => lane.customers.length));
}

/**
 * Calculate fairness metric (how evenly distributed the customers are)
 * Uses coefficient of variation: standard deviation / mean
 * Lower variation means better distribution.
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Fairness score
 */
export function calculateFairnessMetric(lanes) {
  if (lanes.length === 0) return 0;

  const queueLengths = lanes.map((lane) => lane.customers.length);
  const mean = queueLengths.reduce((a, b) => a + b, 0) / lanes.length;

  if (mean === 0) return 1;

  const variance =
    queueLengths.reduce((sum, length) => {
      return sum + Math.pow(length - mean, 2);
    }, 0) / lanes.length;

  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;

  // Convert variation into a fairness score
  return 1 / (1 + coefficientOfVariation);
}

/**
 * Compute lane utilization values for the heatmap
 * Each lane is normalized from 0 to 1 based on current workload
 * @param {Array} lanes - Array of lane objects
 * @returns {Object} Object where keys are lane IDs and values are utilization ratios
 */
export function computeUtilizations(lanes) {
  const workloads = lanes.map((lane) => {
    const totalItems = lane.customers.reduce((sum, customer) => {
      return sum + Number(customer.processed ? 0 : customer.items || 0);
    }, 0);

    const speed = Number(lane.speed) || 1;

    return {
      id: lane.id,
      workload: totalItems / speed,
    };
  });

  const maxWorkload = Math.max(
    ...workloads.map((lane) => lane.workload),
    1
  );

  const utilizationMap = {};

  for (const lane of workloads) {
    utilizationMap[lane.id] = Math.min(1, lane.workload / maxWorkload || 0);
  }

  return utilizationMap;
}

/**
 * Generate a complete metrics report
 * @param {Array} lanes - Array of lane objects
 * @returns {Object} Comprehensive metrics object
 */
export function generateMetricsReport(lanes) {
  return {
    makespan: calculateMakespan(lanes),
    averageWaitTime: calculateAverageWaitTime(lanes),
    totalIdleTime: calculateTotalIdleTime(lanes),
    utilization: calculateUtilization(lanes),
    averageQueueLength: calculateAverageQueueLength(lanes),
    averageServiceTime: calculateAverageServiceTime(lanes),
    maxQueueLength: calculateMaxQueueLength(lanes),
    minQueueLength: calculateMinQueueLength(lanes),
    fairnessMetric: calculateFairnessMetric(lanes),
    totalCustomers: lanes.reduce((sum, lane) => {
      return sum + lane.customers.length;
    }, 0),
    totalLanes: lanes.length,
  };
}

/**
 * Compare two metric reports and calculate improvement
 * @param {Object} baseline - Baseline metrics, usually SLF
 * @param {Object} candidate - Candidate metrics, usually EFT
 * @returns {Object} Improvements where positive values mean better EFT performance
 */
export function compareMetrics(baseline, candidate) {
  function calculateImprovement(baselineValue, candidateValue) {
    const base = Number(baselineValue) || 0;
    const current = Number(candidateValue) || 0;

    if (base === 0) return "0.00";

    return (((base - current) / base) * 100).toFixed(2);
  }

  function calculateDifference(baselineValue, candidateValue) {
    const base = Number(baselineValue) || 0;
    const current = Number(candidateValue) || 0;

    return (current - base).toFixed(2);
  }

  if (!baseline || !candidate) return null;

  return {
    makespanImprovement: calculateImprovement(
      baseline.makespan,
      candidate.makespan
    ),
    waitTimeImprovement: calculateImprovement(
      baseline.averageWaitTime,
      candidate.averageWaitTime
    ),
    idleTimeReduction: calculateImprovement(
      baseline.totalIdleTime,
      candidate.totalIdleTime
    ),
    utilizationImprovement: calculateDifference(
      baseline.utilization,
      candidate.utilization
    ),
    fairnessImprovement: calculateDifference(
      baseline.fairnessMetric,
      candidate.fairnessMetric
    ),
  };
}