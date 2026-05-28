import { MinHeap } from './minHeap.js';

/**
 * Assigns a customer to a lane using the EFT (Earliest Finish Time) Greedy algorithm
 * with heap-based selection for O(log L) lane lookup complexity.
 * 
 * Algorithm:
 * 1. Create a min-heap of lanes keyed by nextAvailability (finish time)
 * 2. Extract the lane with minimum finish time - O(log L)
 * 3. Calculate service time: serviceTime = customer.items / lane.speed
 * 4. Update lane's finish time: newFinish = currentFinish + serviceTime
 * 5. Return updated lanes with customer assigned
 * 
 * Overall complexity: O(N log L) where N = customers, L = lanes
 */
export function assignCustomerEFT(lanes, customer) {
    // Create min-heap with lanes keyed by nextAvailability
    // Use speed as tie-breaker: prefer faster lanes when finish times are equal
    const laneHeap = new MinHeap((a, b) => {
        const finishTimeA = Number(a.nextAvailable) || 0;
        const finishTimeB = Number(b.nextAvailable) || 0;
        
        if (finishTimeA !== finishTimeB) {
            return finishTimeA - finishTimeB;
        }
        
        // Tie-breaker: prefer faster lane (higher speed = lower service time)
        const speedA = Number(a.speed) || 1;
        const speedB = Number(b.speed) || 1;
        return speedB - speedA;  // Higher speed first
    });

    // Insert all lanes into heap - O(L log L)
    lanes.forEach((lane) => laneHeap.insert(lane));

    // Extract the lane with minimum finish time - O(log L)
    const bestLane = laneHeap.extractMin();

    if (!bestLane) { return lanes;}

    // Calculate projected finish time
    const speed = Number(bestLane.speed) || 1;
    const currentFinish = Number(bestLane.nextAvailable) || 0;
    const serviceTime = customer.items / speed;
    const newFinishTime = currentFinish + serviceTime;

    // Update lanes with customer assigned to best lane
    const updatedLanes = lanes.map((lane) => {
        // OTHER lanes remain unchanged (except selected flag)
        if (lane.id !== bestLane.id) {
            return { ...lane, selected: false };
        }

        // BEST lane gets customer
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
