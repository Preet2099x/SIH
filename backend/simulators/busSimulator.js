// backend/simulators/busSimulator.js
// Smooth ping-pong simulator with explicit Completed status at endpoints.
// - status values: "ENROUTE", "COMPLETED", "DEPARTING"
// - isCompleted: boolean (true while in completed/dwell period)
// - dwellingUntil: timestamp (ms) while bus is paused at endpoint

export default function startBusSimulator(buses, onTickCallback) {
  const TICK_MS = 1000; // simulator tick (ms)
  const DEFAULT_SEGMENT_DURATION_MS = 10_000; // time to travel segment (ms)
  const DEFAULT_DWELL_MS_END = 10_000; // dwell at endpoints (ms)

  const lerp = (a, b, t) => a + (b - a) * t;

  // initialize bus fields
  buses.forEach((b) => {
    if (typeof b.currentIndex !== "number") b.currentIndex = 0;
    if (typeof b.progress !== "number") b.progress = 0;
    if (typeof b.segmentDurationMs !== "number") b.segmentDurationMs = DEFAULT_SEGMENT_DURATION_MS;
    if (typeof b.direction !== "number") b.direction = 1; // +1 forward, -1 backward
    if (typeof b.dwellMsEnd !== "number") b.dwellMsEnd = DEFAULT_DWELL_MS_END;

    // internal: dwellingUntil timestamp (ms) when bus is paused; 0 means not dwelling
    if (typeof b._dwellingUntil !== "number") b._dwellingUntil = 0;

    // explicit status and completed flag
    b.status = b.status || "ENROUTE"; // ENROUTE | COMPLETED | DEPARTING
    b.isCompleted = !!b.isCompleted;

    // initialize lat/lng for clients
    const cur = b.stops && b.stops[b.currentIndex];
    if (cur) {
      b.lat = cur.lat;
      b.lng = cur.lng;
    } else {
      b.lat = b.lat ?? 0;
      b.lng = b.lng ?? 0;
    }
  });

  function broadcast(bus) {
    if (typeof onTickCallback !== "function") return;
    onTickCallback({
      id: bus.id,
      name: bus.name,
      lat: bus.lat,
      lng: bus.lng,
      currentIndex: bus.currentIndex,
      progress: +bus.progress.toFixed(3),
      direction: bus.direction,
      status: bus.status,
      isCompleted: !!bus.isCompleted,
      currentStop: bus.currentStop,
      nextStop: bus.nextStop,
      distanceLeft: bus.distanceLeft,
      lastUpdated: bus.lastUpdated,
      dwellingUntil: bus._dwellingUntil || null,
    });
  }

  function tick() {
    const now = Date.now();

    buses.forEach((bus) => {
      const len = (bus.stops && bus.stops.length) || 0;
      if (len === 0) {
        bus.lastUpdated = now;
        broadcast(bus);
        return;
      }

      // If currently dwelling at an endpoint, keep COMPLETED state until dwell expires
      if (bus._dwellingUntil && now < bus._dwellingUntil) {
        // ensure explicit completed
        bus.status = "COMPLETED";
        bus.isCompleted = true;
        bus.lastUpdated = now;
        broadcast(bus);
        return; // skip movement update while dwelling
      }

      // If dwelling existed and expired, transition to DEPARTING then continue movement
      if (bus._dwellingUntil && now >= bus._dwellingUntil) {
        bus._dwellingUntil = 0;
        bus.isCompleted = false;
        bus.status = "DEPARTING"; // one tick flagged as departing
        bus.lastUpdated = now;
        // broadcast this departing state so UI can react immediately
        broadcast(bus);
        // continue to movement logic on this same tick so movement is not delayed an extra whole dwell
      }

      // Movement logic
      const curIdx = bus.currentIndex;
      const nextIdxRaw = curIdx + bus.direction;
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

        // If we've reached an endpoint, set explicit COMPLETED + isCompleted and start dwell
        if (bus.currentIndex === 0 || bus.currentIndex === len - 1) {
          bus.progress = 0; // snap progress at endpoint
          bus.status = "COMPLETED";
          bus.isCompleted = true;
          bus._dwellingUntil = Date.now() + (bus.dwellMsEnd ?? DEFAULT_DWELL_MS_END);

          // place bus exactly at endpoint coordinates
          const endpoint = bus.stops[bus.currentIndex];
          bus.lat = endpoint.lat;
          bus.lng = endpoint.lng;

          // flip direction now so next movement heads back
          if (bus.currentIndex === 0) bus.direction = 1;
          else bus.direction = -1;

          // broadcast completed immediately
          bus.currentStop = bus.stops[bus.currentIndex];
          const nxt = Math.min(Math.max(bus.currentIndex + bus.direction, 0), len - 1);
          bus.nextStop = bus.stops[nxt];
          const curDist = bus.currentStop.distance || 0;
          const nextDist = bus.nextStop.distance || curDist;
          bus.distanceLeft = Math.max(0, nextDist - (curDist + (nextDist - curDist) * bus.progress));
          bus.lastUpdated = Date.now();
          broadcast(bus);
          return; // stop processing; dwell will handle future ticks
        } else {
          // intermediate stop — carry remainder into next segment and stay ENROUTE
          bus.progress = remainder;
          bus.status = "ENROUTE";
          bus.isCompleted = false;

          const newNextIdxRaw = bus.currentIndex + bus.direction;
          let newNextIdx = newNextIdxRaw;
          if (newNextIdx < 0) newNextIdx = 0;
          if (newNextIdx >= len) newNextIdx = len - 1;

          const newCur = bus.stops[bus.currentIndex];
          const newNext = bus.stops[newNextIdx];

          bus.lat = lerp(newCur.lat, newNext.lat, bus.progress);
          bus.lng = lerp(newCur.lng, newNext.lng, bus.progress);
        }
      } else {
        // normal interpolation while moving between stops
        bus.lat = lerp(curStop.lat, nextStop.lat, bus.progress);
        bus.lng = lerp(curStop.lng, nextStop.lng, bus.progress);
        bus.status = "ENROUTE";
        bus.isCompleted = false;
      }

      // expose convenient fields
      bus.currentStop = bus.stops[bus.currentIndex];
      const nxtIdx = Math.min(Math.max(bus.currentIndex + bus.direction, 0), len - 1);
      bus.nextStop = bus.stops[nxtIdx];
      const curDist = bus.currentStop.distance || 0;
      const nextDist = bus.nextStop.distance || curDist;
      bus.distanceLeft = Math.max(0, nextDist - (curDist + (nextDist - curDist) * bus.progress));
      bus.lastUpdated = Date.now();

      broadcast(bus);
    });
  }

  // start simulator
  setTimeout(() => {
    tick();
    setInterval(tick, TICK_MS);
  }, 200);
}
