// backend/simulators/busSimulator.js
// Moves buses and invokes the optional callback with the updated bus each tick.
export default function startBusSimulator(buses, onTickCallback) {
  const TICK_MS = 5000; // move every 5s

  // initially ensure currentIndex exists
  buses.forEach((b) => {
    if (typeof b.currentIndex !== "number") b.currentIndex = 0;
  });

  // call at start so clients connecting immediately can receive movement soon
  function tick() {
    buses.forEach((bus) => {
      bus.currentIndex = (bus.currentIndex + 1) % bus.stops.length;
      // allow callback to react (broadcast)
      if (typeof onTickCallback === "function") onTickCallback(bus);
    });
  }

  // run first tick after a short delay so server finishes boot
  setTimeout(() => {
    tick();
    setInterval(tick, TICK_MS);
  }, 800);
}
