export default function startBusSimulator(buses) {
  setInterval(() => {
    buses.forEach(bus => {
      bus.currentIndex = (bus.currentIndex + 1) % bus.stops.length;
    });
  }, 5000); // move every 5 seconds
}
