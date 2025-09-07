import express from "express";
import { getAllBuses, getBusById } from "../controllers/bus.controller.js";

const router = express.Router();

router.get("/", getAllBuses);
router.get("/:id", getBusById);

export default router;
