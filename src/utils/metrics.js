// Utilities for computing lane workloads, picks, and basic metrics
export function workloadMinutesForLane(lane) {
	const totalItems = (lane.customers || []).reduce((s, c) => s + (c.items || 0), 0);
	const speed = Number(lane.speed) || 1;
	return totalItems / speed;
}

export function workloadsForLanes(lanes) {
	return lanes.map((lane) => ({ id: lane.id, workload: workloadMinutesForLane(lane) }));
}

export function pickShortestLineByCount(lanes) {
	return lanes.reduce((best, lane) => {
		if (!best) return lane;
		if ((lane.customers || []).length < (best.customers || []).length) return lane;
		return best;
	}, null);
}

export function pickEFTLane(lanes, newItems) {
	// Earliest finish time heuristic: pick lane minimizing currentWorkload + newItems/speed
	let best = null;
	let bestVal = Infinity;

	for (const lane of lanes) {
		const workload = workloadMinutesForLane(lane);
		const speed = Number(lane.speed) || 1;
		const finish = workload + (Number(newItems) || 0) / speed;

		if (finish < bestVal) {
			bestVal = finish;
			best = lane;
		}
	}

	return best;
}

export function computeUtilizations(lanes) {
	const workloads = workloadsForLanes(lanes);
	const maxWork = Math.max(...workloads.map((w) => w.workload), 1);

	const map = {};
	for (const w of workloads) {
		map[w.id] = Math.min(1, w.workload / maxWork || 0);
	}

	return map;
}

export function averageWait(totalWait, count) {
	return count > 0 ? totalWait / count : 0;
}

export function approximateTotalIdleTime(lanes, utilMap, windowMinutes = 60) {
	// approximate idle time per lane as (1 - utilization) * window
	return lanes.reduce((s, lane) => {
		const u = utilMap[lane.id] || 0;
		return s + (1 - u) * windowMinutes;
	}, 0);
}
