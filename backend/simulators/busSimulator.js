// backend/simulators/busSimulator.js
// Smooth bus movement simulator — interpolates between stops instead of teleporting.

export default function startBusSimulator(buses, onTickCallback) {
  // How often simulator emits updates (ms). Smaller => smoother on clients.
  const TICK_MS = 1000;

  // Default time (ms) to traverse one segment (stop -> next stop) if bus.segmentDurationMs not provided.
  const DEFAULT_SEGMENT_DURATION_MS = 10_000;

  // linear interpolation helper
  const lerp = (a, b, t) => a + (b - a) * t;

  // ensure each bus has required fields
  buses.forEach((b) => {
    if (typeof b.currentIndex !== "number") b.currentIndex = 0;
    if (typeof b.progress !== "number") b.progress = 0; // 0..1 along current->next
    if (typeof b.segmentDurationMs !== "number") b.segmentDurationMs = DEFAULT_SEGMENT_DURATION_MS;
    // set initial lat/lng to current stop coordinates for clients that read them immediately
    const cur = b.stops[b.currentIndex];
    b.lat = cur.lat;
    b.lng = cur.lng;
  });

  function tick() {
    buses.forEach((bus) => {
      const curIdx = bus.currentIndex;
      const nextIdx = (curIdx + 1) % bus.stops.length;
      const curStop = bus.stops[curIdx];
      const nextStop = bus.stops[nextIdx];

      // avoid division by zero
      const segDuration = Math.max(100, bus.segmentDurationMs);

      // how much progress to add this tick
      const delta = TICK_MS / segDuration;
      bus.progress = (bus.progress ?? 0) + delta;

      // if we've reached or passed the next stop, advance index and carry over leftover progress
      if (bus.progress >= 1) {
        // carry remainder so movement is continuous if progress overshoots
        const remainder = bus.progress - 1;
        bus.currentIndex = nextIdx;
        bus.progress = remainder;

        // recompute cur/next after index change
        const newNextIdx = (bus.currentIndex + 1) % bus.stops.length;
        const newCur = bus.stops[bus.currentIndex];
        const newNext = bus.stops[newNextIdx];

        // set lat/lng using the remainder progress on new segment
        bus.lat = lerp(newCur.lat, newNext.lat, bus.progress);
        bus.lng = lerp(newCur.lng, newNext.lng, bus.progress);
      } else {
        // normal interpolation between curStop and nextStop
        bus.lat = lerp(curStop.lat, nextStop.lat, bus.progress);
        bus.lng = lerp(curStop.lng, nextStop.lng, bus.progress);
      }

      // Also expose some convenient fields so controllers/clients can avoid recomputing
      bus.currentStop = bus.stops[bus.currentIndex];
      bus.nextStop = bus.stops[(bus.currentIndex + 1) % bus.stops.length];
      bus.distanceLeft = Math.max(0, (bus.nextStop.distance || 0) - (bus.currentStop.distance || 0));
      // timestamp helpful for clients
      bus.lastUpdated = Date.now();

      // broadcast/update via callback
      if (typeof onTickCallback === "function") {
        // send a shallow copy to avoid accidental mutation by receiver
        onTickCallback({
          id: bus.id,
          name: bus.name,
          lat: bus.lat,
          lng: bus.lng,
          currentIndex: bus.currentIndex,
          progress: +bus.progress.toFixed(3),
          currentStop: bus.currentStop,
          nextStop: bus.nextStop,
          distanceLeft: bus.distanceLeft,
          lastUpdated: bus.lastUpdated,
        });
      }
    });
  }

  // start after tiny delay so server setup completes
  setTimeout(() => {
    tick(); // immediate first update
    setInterval(tick, TICK_MS);
  }, 200);
}
