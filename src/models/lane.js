export function createLane(id, speed = 1) {
  return {
    id,
    speed,
    nextAvailable: 0,
    customers: [],
  };
}

export function createLanes(count) {
  return Array.from({ length: count }, (_, index) => createLane(index + 1));
}

export function calculateLaneNextAvailable(speed, customers) {
  if (!speed || customers.length === 0) {
    return 0;
  }

  const totalItems = customers.reduce(
    (total, customer) => total + (customer.processed ? 0 : customer.items),
    0
  );

  return Number((totalItems / speed).toFixed(2));
}

export function withLaneSpeed(lane, value) {
  const speed = Math.max(1, Number(value) || 1);
  return {
    ...lane,
    speed,
    nextAvailable: calculateLaneNextAvailable(speed, lane.customers),
  };
}

export function removeLaneCustomer(lane, customerId) {
  const updatedCustomers = lane.customers.filter((customer) => customer.id !== customerId);
  return {
    ...lane,
    customers: updatedCustomers,
    nextAvailable: calculateLaneNextAvailable(lane.speed, updatedCustomers),
  };
}

export function addLaneCustomer(lane, customer) {
  const updatedCustomers = [...lane.customers, customer];
  return {
    ...lane,
    customers: updatedCustomers,
    nextAvailable: calculateLaneNextAvailable(lane.speed, updatedCustomers),
  };
}
