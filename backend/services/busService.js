import { buses } from "../data/buses.js";

class BusService {
  constructor() {
    this.buses = buses;
  }

  getAllBuses() {
    return this.buses.map(bus => ({
      id: bus.id,
      name: bus.name,
      from: bus.from,
      to: bus.to,
      route: bus.route,
      currentIndex: bus.currentIndex || 0,
      totalStops: bus.stops.length
    }));
  }

  getBusById(id) {
    return this.buses.find(bus => bus.id === id);
  }

  searchBuses(filters = {}) {
    const { from, to, searchQuery } = filters;
    
    return this.buses.filter(bus => {
      let matches = true;

      // Direct route matching (from -> to)
      if (from && to) {
        const directMatch = (
          bus.from?.toLowerCase().includes(from.toLowerCase()) &&
          bus.to?.toLowerCase().includes(to.toLowerCase())
        );
        
        if (!directMatch) {
          // Check if route passes through both cities via stops
          const stops = bus.stops || [];
          const fromStopIndex = stops.findIndex(stop => 
            stop.name.toLowerCase().includes(from.toLowerCase())
          );
          const toStopIndex = stops.findIndex(stop => 
            stop.name.toLowerCase().includes(to.toLowerCase())
          );
          
          matches = fromStopIndex !== -1 && toStopIndex !== -1 && fromStopIndex < toStopIndex;
        } else {
          matches = directMatch;
        }
      } else if (from) {
        // Origin matching
        matches = bus.from?.toLowerCase().includes(from.toLowerCase()) ||
                 bus.stops?.some(stop => stop.name.toLowerCase().includes(from.toLowerCase()));
      } else if (to) {
        // Destination matching
        matches = bus.to?.toLowerCase().includes(to.toLowerCase()) ||
                 bus.stops?.some(stop => stop.name.toLowerCase().includes(to.toLowerCase()));
      }

      // General search query matching
      if (matches && searchQuery) {
        const query = searchQuery.toLowerCase();
        matches = bus.name.toLowerCase().includes(query) ||
                 bus.route.toLowerCase().includes(query) ||
                 bus.from?.toLowerCase().includes(query) ||
                 bus.to?.toLowerCase().includes(query) ||
                 bus.stops?.some(stop => stop.name.toLowerCase().includes(query));
      }

      return matches;
    });
  }

  getBusesWithLiveStatus() {
    return this.buses.map(bus => {
      const currentIndex = typeof bus.currentIndex === "number" ? bus.currentIndex : 0;
      const progress = typeof bus.progress === "number" ? bus.progress : 0;
      const currentStop = bus.stops[currentIndex];
      const nextStop = bus.stops[(currentIndex + 1) % bus.stops.length];

      return {
        id: bus.id,
        name: bus.name,
        from: bus.from,
        to: bus.to,
        route: bus.route,
        currentIndex,
        progress,
        currentStop,
        nextStop,
        totalDistance: bus.stops[bus.stops.length - 1]?.distance || 0,
        estimatedTime: this.calculateEstimatedTime(bus, currentIndex, progress)
      };
    });
  }

  calculateEstimatedTime(bus, currentIndex, progress) {
    // Simple estimation based on remaining stops and average time per stop
    const remainingStops = bus.stops.length - currentIndex - progress;
    const avgTimePerStop = 15; // minutes
    return Math.round(remainingStops * avgTimePerStop);
  }

  getPopularRoutes() {
    // Get unique routes and count frequency
    const routeMap = new Map();
    
    this.buses.forEach(bus => {
      const routeKey = `${bus.from}-${bus.to}`;
      if (routeMap.has(routeKey)) {
        routeMap.set(routeKey, {
          ...routeMap.get(routeKey),
          busCount: routeMap.get(routeKey).busCount + 1
        });
      } else {
        routeMap.set(routeKey, {
          from: bus.from,
          to: bus.to,
          route: bus.route,
          busCount: 1,
          sampleBusId: bus.id
        });
      }
    });

    return Array.from(routeMap.values())
      .sort((a, b) => b.busCount - a.busCount)
      .slice(0, 10);
  }
}

export default new BusService();
