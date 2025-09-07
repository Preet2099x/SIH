import { buses } from "../data/buses.js";

export const getAllBuses = (req, res) => {
  res.json(buses.map(({ id, name }) => ({ id, name })));
};

export const getBusById = (req, res) => {
  const bus = buses.find(b => b.id === req.params.id);
  if (!bus) return res.status(404).json({ error: "Bus not found" });

  const currentStop = bus.stops[bus.currentIndex];
  const nextStop = bus.stops[(bus.currentIndex + 1) % bus.stops.length];
  const distanceLeft = nextStop.distance - currentStop.distance;

  res.json({
    id: bus.id,
    name: bus.name,
    stops: bus.stops,
    currentIndex: bus.currentIndex,
    currentStop,
    nextStop,
    distanceLeft,
  });
};
