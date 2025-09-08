// backend/simulators/busSimulator.js
// Smooth bus movement simulator — interpolates between stops instead of teleporting.
// Now with ping-pong direction: forward to last stop, then reverse back.

export default function startBusSimulator(buses, onTickCallback) {
  const TICK_MS = 1000; // update interval (ms)
  const DEFAULT_SEGMENT_DURATION_MS = 10_000; // time to traverse one segment (ms)

  const lerp = (a, b, t) => a + (b - a) * t;

  // ensure each bus has required fields
  buses.forEach((b) => {
    if (typeof b.currentIndex !== "number") b.currentIndex = 0;
    if (typeof b.progress !== "number") b.progress = 0;
    if (typeof b.segmentDurationMs !== "number") b.segmentDurationMs = DEFAULT_SEGMENT_DURATION_MS;
    if (typeof b.direction !== "number") b.direction = 1; // 1 = forward, -1 = backward
    const cur = b.stops[b.currentIndex];
    b.lat = cur.lat;
    b.lng = cur.lng;
  });

  function tick() {
    buses.forEach((bus) => {
      const len = bus.stops.length;
      const curIdx = bus.currentIndex;
      const nextIdxRaw = curIdx + bus.direction;

      // clamp nextIdx to stay within bounds
      let nextIdx = nextIdxRaw;
      if (nextIdx < 0) nextIdx = 0;
      if (nextIdx >= len) nextIdx = len - 1;

      const curStop = bus.stops[curIdx];
      const nextStop = bus.stops[nextIdx];
      const segDuration = Math.max(100, bus.segmentDurationMs);
      const delta = TICK_MS / segDuration;
      bus.progress = (bus.progress ?? 0) + delta;

      if (bus.progress >= 1) {
        const remainder = bus.progress - 1;
        bus.currentIndex = nextIdx;
        bus.progress = remainder;

        // flip direction at ends
        if (bus.currentIndex === 0) {
          bus.direction = 1;
        } else if (bus.currentIndex === len - 1) {
          bus.direction = -1;
        }

        // recalc after index change
        const newNextIdxRaw = bus.currentIndex + bus.direction;
        let newNextIdx = newNextIdxRaw;
        if (newNextIdx < 0) newNextIdx = 0;
        if (newNextIdx >= len) newNextIdx = len - 1;

        const newCur = bus.stops[bus.currentIndex];
        const newNext = bus.stops[newNextIdx];

        bus.lat = lerp(newCur.lat, newNext.lat, bus.progress);
        bus.lng = lerp(newCur.lng, newNext.lng, bus.progress);
      } else {
        bus.lat = lerp(curStop.lat, nextStop.lat, bus.progress);
        bus.lng = lerp(curStop.lng, nextStop.lng, bus.progress);
      }

      // expose convenient fields
      bus.currentStop = bus.stops[bus.currentIndex];
      const nxtIdx = bus.currentIndex + bus.direction;
      const clampedNextIdx = Math.min(Math.max(nxtIdx, 0), len - 1);
      bus.nextStop = bus.stops[clampedNextIdx];
      const curDist = bus.currentStop.distance || 0;
      const nextDist = bus.nextStop.distance || curDist;
      bus.distanceLeft = Math.max(0, nextDist - (curDist + (nextDist - curDist) * bus.progress));
      bus.lastUpdated = Date.now();

      if (typeof onTickCallback === "function") {
        onTickCallback({
          id: bus.id,
          name: bus.name,
          lat: bus.lat,
          lng: bus.lng,
          currentIndex: bus.currentIndex,
          progress: +bus.progress.toFixed(3),
          direction: bus.direction,
          currentStop: bus.currentStop,
          nextStop: bus.nextStop,
          distanceLeft: bus.distanceLeft,
          lastUpdated: bus.lastUpdated,
        });
      }
    });
  }

  setTimeout(() => {
    tick();
    setInterval(tick, TICK_MS);
  }, 200);
}
