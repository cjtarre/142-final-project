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
    return Math.max(...lanes.map(lane => Number(lane.nextAvailable) || 0));
}

/**
 * Calculate average wait time (ETA) for customers
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Average ETA
 */
export function calculateAverageWaitTime(lanes) {
    const allCustomers = lanes.flatMap(lane => lane.customers);
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

        // Actual work done (sum of all customer items)
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
 * @returns {number} Utilization percentage (0-100)
 */
export function calculateUtilization(lanes) {
    if (lanes.length === 0) return 0;

    const totalCapacity = lanes.reduce((sum, lane) => {
        const laneTime = Number(lane.nextAvailable) || 0;
        const speed = Number(lane.speed) || 1;
        return sum + speed * laneTime;
    }, 0);

    const totalWork = lanes.reduce((sum, lane) => {
        return sum + lane.customers.reduce((sum, customer) => {
            return sum + Number(customer.items || 0);
        }, 0);
    }, 0);

    return totalCapacity > 0 ? (totalWork / totalCapacity) * 100 : 0;
}

/**
 * Calculate average queue length (customers per lane)
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Average number of customers per lane
 */
export function calculateAverageQueueLength(lanes) {
    if (lanes.length === 0) return 0;
    const totalCustomers = lanes.reduce((sum, lane) => sum + lane.customers.length, 0);
    return totalCustomers / lanes.length;
}

/**
 * Calculate average service time per customer
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Average service time
 */
export function calculateAverageServiceTime(lanes) {
    const allCustomers = lanes.flatMap(lane => lane.customers);
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
    return Math.max(...lanes.map(lane => lane.customers.length));
}

/**
 * Get minimum queue length (shortest line)
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Minimum customers in any single lane
 */
export function calculateMinQueueLength(lanes) {
    if (lanes.length === 0) return 0;
    return Math.min(...lanes.map(lane => lane.customers.length));
}

/**
 * Calculate fairness metric (how evenly distributed are customers)
 * Uses coefficient of variation: stdDev / mean
 * Lower values mean more balanced distribution
 * @param {Array} lanes - Array of lane objects
 * @returns {number} Fairness score (0-1, higher is more fair)
 */
export function calculateFairnessMetric(lanes) {
    if (lanes.length === 0) return 0;

    const queueLengths = lanes.map(lane => lane.customers.length);
    const mean = queueLengths.reduce((a, b) => a + b, 0) / lanes.length;

    if (mean === 0) return 1; // Perfect fairness if no customers

    const variance = queueLengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lanes.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    // Convert to fairness score (higher = more fair)
    // Using 1 / (1 + cv) to get score between 0 and 1
    return 1 / (1 + coefficientOfVariation);
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
        totalCustomers: lanes.reduce((sum, lane) => sum + lane.customers.length, 0),
        totalLanes: lanes.length,
    };
}

/**
 * Compare two metric reports and calculate improvement
 * @param {Object} baseline - Baseline metrics (e.g., SLF)
 * @param {Object} candidate - Candidate metrics (e.g., EFT)
 * @returns {Object} Improvements (positive = better)
 */
export function compareMetrics(baseline, candidate) {
    return {
        makespanImprovement: (((baseline.makespan - candidate.makespan) / baseline.makespan) * 100).toFixed(2),
        waitTimeImprovement: (((baseline.averageWaitTime - candidate.averageWaitTime) / baseline.averageWaitTime) * 100).toFixed(2),
        idleTimeReduction: (((baseline.totalIdleTime - candidate.totalIdleTime) / baseline.totalIdleTime) * 100).toFixed(2),
        utilizationImprovement: (candidate.utilization - baseline.utilization).toFixed(2),
        fairnessImprovement: (candidate.fairnessMetric - baseline.fairnessMetric).toFixed(4),
    };
}
