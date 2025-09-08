import express from "express";
import cors from "cors";
import busRoutes from "./routes/bus.routes.js";
import startBusSimulator from "./simulators/busSimulator.js";
import { buses } from "./data/buses.js";

const app = express();
app.use(cors());

app.use("/buses", busRoutes);

// Start simulator
startBusSimulator(buses);

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
