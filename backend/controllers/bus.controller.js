import busService from "../services/busService.js";

export const getAllBuses = (req, res) => {
  try {
    const buses = busService.getAllBuses();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch buses", details: error.message });
  }
};

export const searchBuses = (req, res) => {
  try {
    const { from, to, searchQuery } = req.query;
    const buses = busService.searchBuses({ from, to, searchQuery });
    res.json({
      buses,
      total: buses.length,
      query: { from, to, searchQuery }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to search buses", details: error.message });
  }
};

export const getBusById = (req, res) => {
  try {
    const bus = busService.getBusById(req.params.id);
    if (!bus) return res.status(404).json({ error: "Bus not found" });

    // ensure sensible defaults so frontends don't explode if simulator isn't running
    const currentIndex = typeof bus.currentIndex === "number" ? bus.currentIndex : 0;
    const progress = typeof bus.progress === "number" ? bus.progress : 0; // 0..1
    const currentStop = bus.stops[currentIndex];
    const nextStop = bus.stops[(currentIndex + 1) % bus.stops.length];

    // compute remaining distance along this segment (supports fractional progress)
    // If stops have `distance` fields it's interpreted as cumulative distance along route.
    const curDist = (currentStop && typeof currentStop.distance === "number") ? currentStop.distance : 0;
    const nextDist = (nextStop && typeof nextStop.distance === "number") ? nextStop.distance : curDist;
    const distanceAlongSegment = curDist + (nextDist - curDist) * progress;
    const distanceLeft = Math.max(0, nextDist - distanceAlongSegment);

    // live coords (fall back to current stop if simulator hasn't set lat/lng)
    const lat = typeof bus.lat === "number" ? bus.lat : currentStop.lat;
    const lng = typeof bus.lng === "number" ? bus.lng : currentStop.lng;

    res.json({
      id: bus.id,
      name: bus.name,
      from: bus.from,
      to: bus.to,
      route: bus.route,
      // full route for client-side timeline/rendering (keeps existing behavior)
      stops: bus.stops,
      currentIndex,
      progress: +progress.toFixed(3),
      currentStop,
      nextStop,
      distanceLeft,
      // live position for map marker
      lat,
      lng,
      // optional metadata useful for clients
      segmentDurationMs: bus.segmentDurationMs ?? null,
      lastUpdated: bus.lastUpdated ?? Date.now(),
      estimatedTime: busService.calculateEstimatedTime(bus, currentIndex, progress)
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bus details", details: error.message });
  }
};

export const getPopularRoutes = (req, res) => {
  try {
    const routes = busService.getPopularRoutes();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch popular routes", details: error.message });
  }
};

export const getBusesWithLiveStatus = (req, res) => {
  try {
    const buses = busService.getBusesWithLiveStatus();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch buses with live status", details: error.message });
  }
};
