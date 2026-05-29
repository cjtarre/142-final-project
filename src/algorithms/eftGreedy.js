import { MinHeap } from "./minHeap";

/**
 * Assigns customers to checkout lanes using the
 * Earliest Finish Time (EFT) Greedy Algorithm.
 *
 * Optimized using a Min-Heap priority queue.
 *
 * Complexity:
 * - Heap initialization: O(L log L)
 * - Customer assignments: O(N log L)
 * - Overall: O(N log L)
 *
 * Greedy Strategy:
 * Always assign the next customer to the lane
 * with the smallest projected finish time.
 */

/**
 * Processes ALL staged customers using one persistent heap.
 *
 * @param {Array} lanes - Array of checkout lanes
 * @param {Array} customers - Array of staged customers
 * @returns {Array} Updated lanes with assigned customers
 */
export function assignCustomersEFT(lanes, customers) {

  /**
   * Min-Heap comparator:
   * 1. Prioritize smallest nextAvailable time
   * 2. Tie-breaker: prioritize faster lane speed
   */
  const laneHeap = new MinHeap((a, b) => {

    const finishA = Number(a.nextAvailable) || 0;
    const finishB = Number(b.nextAvailable) || 0;

    // Primary priority:
    // Smaller finish time first
    if (finishA !== finishB) {
      return finishA - finishB;
    }

    // Tie-breaker:
    // Faster cashier first
    const speedA = Number(a.speed) || 1;
    const speedB = Number(b.speed) || 1;

    return speedB - speedA;
  });

  /**
   * Clone lane state to avoid direct mutation
   */
  const updatedLanes = lanes.map((lane) => ({
    ...lane,
    nextAvailable: Number(lane.nextAvailable) || 0,
    customers: [...lane.customers],
  }));

  /**
   * Insert all lanes into heap
   * Complexity: O(L log L)
   */
  updatedLanes.forEach((lane) => {
    laneHeap.insert(lane);
  });

  /**
   * Assign customers one-by-one
   * Complexity: O(N log L)
   */
  for (const customer of customers) {

    /**
     * Extract lane with earliest finish time
     */
    const bestLane = laneHeap.extractMin();

    if (!bestLane) {
      continue;
    }

    /**
     * Compute service time
     *
     * Formula:
     * serviceTime = items / cashierSpeed
     */
    const speed = Number(bestLane.speed) || 1;

    const serviceTime =
      Number(customer.items) / speed;

    /**
     * Compute updated finish time
     *
     * Formula:
     * newFinish = currentFinish + serviceTime
     */
    const newFinishTime =
      bestLane.nextAvailable + serviceTime;

    /**
     * Create updated lane object
     */
    const updatedLane = {
      ...bestLane,

      nextAvailable: Number(
        newFinishTime.toFixed(2)
      ),

      customers: [
        ...bestLane.customers,

        {
          ...customer,

          eta: Number(
            newFinishTime.toFixed(2)
          ),

          serviceTime: Number(
            serviceTime.toFixed(2)
          ),

          processed: false,
          active: false,
        },
      ],
    };

    /**
     * Reinsert updated lane into heap
     */
    laneHeap.insert(updatedLane);
  }

  /**
   * Convert heap back to ordered lane array
   */
  return laneHeap
    .toArray()
    .sort((a, b) => a.id - b.id);
}