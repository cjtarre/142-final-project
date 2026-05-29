export function createPendingCustomerDraft(customerId = 1) {
  return {
    name: `Customer ${customerId}`,
    items: "1",
  };
}

export function updatePendingCustomerDraft(draft, field, value) {
  return {
    ...draft,
    [field]: field === "items" ? value : value,
  };
}

export function createPendingCustomer({ name, items, customerId }) {
  return {
    tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || `Customer ${customerId}`,
    items: Number(items),
    minimized: true,
  };
}

export function updatePendingCustomer(customer, field, value) {
  return {
    ...customer,
    [field]: field === "items" ? Number(value) : value,
  };
}

export function togglePendingCustomerMinimized(customer, isMinimized) {
  return {
    ...customer,
    minimized: isMinimized,
  };
}

export function createLaneCustomer({ name, items, id, order }) {
  return {
    id,
    name,
    items,
    totalItems: items,
    processedItems: 0,
    order,
    showOrder: true,
    processed: false,
    active: false,
  };
}

export function isCustomerMutable(customer) {
  return !customer.processed && !customer.active;
}
