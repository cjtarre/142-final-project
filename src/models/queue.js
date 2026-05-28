export function enqueue(queue, item) {
  return [...queue, item];
}

export function dequeue(queue) {
  if (queue.length === 0) {
    return { item: null, queue: [] };
  }

  const [item, ...nextQueue] = queue;
  return { item, queue: nextQueue };
}

export function moveItem(queue, index, direction) {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= queue.length) {
    return queue;
  }

  const next = [...queue];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

export function updateItem(queue, id, updater) {
  return queue.map((item) => (item.tempId === id ? updater(item) : item));
}

export function removeItem(queue, id) {
  return queue.filter((item) => item.tempId !== id);
}
