// backend/server.js
import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import busRoutes from "./routes/bus.routes.js";
import startBusSimulator from "./simulators/busSimulator.js";
import { buses } from "./data/buses.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/buses", busRoutes);

const server = http.createServer(app);

// create WebSocket server on same http server under path /ws
const wss = new WebSocketServer({ server, path: "/ws" });

// util: send JSON safely
function sendJSON(ws, obj) {
  try {
    ws.send(JSON.stringify(obj));
  } catch (e) {
    console.error("Failed to send ws message", e);
  }
}

// broadcast helper
function broadcast(obj) {
  const text = JSON.stringify(obj);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(text);
  });
}

// on new ws connection -> send initial snapshot
wss.on("connection", (ws, req) => {
  console.log("WS client connected", req.socket.remoteAddress);

  // initial snapshot: send all buses' basic state
  const snapshot = buses.map((b) => ({
    id: b.id,
    currentIndex: b.currentIndex,
    currentStop: b.stops[b.currentIndex],
  }));
  sendJSON(ws, { type: "snapshot", payload: snapshot });

  ws.on("message", (msg) => {
    // optional: handle client messages if needed (admin, ping, etc)
    // keep this minimal for the demo
    try {
      const parsed = JSON.parse(msg.toString());
      if (parsed?.type === "ping") sendJSON(ws, { type: "pong" });
    } catch (e) {
      // ignore bad input
    }
  });

  ws.on("close", () => {
    console.log("WS client disconnected");
  });
});

// Start simulator and let it call broadcast on each tick
startBusSimulator(buses, (updatedBus) => {
  // updatedBus is the bus object after movement; we broadcast minimal update
  const payload = {
    id: updatedBus.id,
    currentIndex: updatedBus.currentIndex,
    currentStop: updatedBus.stops[updatedBus.currentIndex],
    nextStop:
      updatedBus.stops[(updatedBus.currentIndex + 1) % updatedBus.stops.length],
    distanceLeft:
      updatedBus.stops[
        (updatedBus.currentIndex + 1) % updatedBus.stops.length
      ].distance -
      updatedBus.stops[updatedBus.currentIndex].distance,
  };

  broadcast({ type: "bus_update", payload });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server (HTTP+WS) running on http://localhost:${PORT}`);
});
