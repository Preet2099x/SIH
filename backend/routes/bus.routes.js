import express from "express";
import { 
  getAllBuses, 
  getBusById, 
  searchBuses,
  getPopularRoutes,
  getBusesWithLiveStatus 
} from "../controllers/bus.controller.js";

const router = express.Router();

// GET /buses - Get all buses
router.get("/", getAllBuses);

// GET /buses/search - Search buses with filters
router.get("/search", searchBuses);

// GET /buses/popular-routes - Get popular routes
router.get("/popular-routes", getPopularRoutes);

// GET /buses/live-status - Get buses with live status
router.get("/live-status", getBusesWithLiveStatus);

// GET /buses/:id - Get specific bus details
router.get("/:id", getBusById);

export default router;
