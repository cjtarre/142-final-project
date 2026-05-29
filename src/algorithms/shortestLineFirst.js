/**
 * Shortest Line First (SLF) Algorithm - Baseline Heuristic
 *
 * A simpler heuristic that assigns customers to the lane with the fewest customers,
 * ignoring both cashier processing speed and customer item loads.
 *
 * Characteristics:
 * - Time Complexity: O(N × L) - linear search for each customer
 * - Approximation Factor: O(log L) in worst case
 * - Simplicity: Trivial to implement, easy to understand
 *
 * This serves as a baseline comparison to show the effectiveness of the EFT algorithm.
 * SLF often creates bottlenecks by overloading slow cashiers and underutilizing fast ones.
 */

/**
 * Assigns a customer to a lane using the Shortest Line First (SLF) heuristic.
 * Selects the lane with the fewest customers regardless of speed or load.
 *
 * @param {Array} lanes - Array of lane objects with id, speed, nextAvailable, customers
 * @param {Object} customer - Customer object with id, name, items, order, showOrder
 * @returns {Array} Updated lanes with customer assigned
 */
export function assignCustomerSLF(lanes, customer) {
    let bestLane = null;
    let shortestLineLength = Infinity;

    // Find the lane with the fewest customers - O(L)
    for (const lane of lanes) {
        const lineLength = lane.customers.length;

        if (lineLength < shortestLineLength) {
            shortestLineLength = lineLength;
            bestLane = lane;
        }
    }

    if (!bestLane) return lanes;

    // Calculate service time and finish time
    const speed = Number(bestLane.speed) || 1;
    const currentFinish = Number(bestLane.nextAvailable) || 0;
    const serviceTime = customer.items / speed;
    const newFinishTime = currentFinish + serviceTime;

    // Update lanes with customer assigned to shortest line
    const updatedLanes = lanes.map((lane) => {
        if (lane.id !== bestLane.id) return { ...lane, selected: false };
        return {
            ...lane,
            selected: true,
            nextAvailable: newFinishTime,
            customers: [
                ...lane.customers,
                {
                    id: customer.id,
                    name: customer.name,
                    items: customer.items,
                    order: customer.order,
                    showOrder: customer.showOrder,
                    eta: newFinishTime.toFixed(2),
                    serviceTime: serviceTime.toFixed(2),
                },
            ],
        };
    });

    return updatedLanes;
}
