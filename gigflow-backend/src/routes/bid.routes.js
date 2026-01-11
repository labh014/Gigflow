import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
    createBid,
    getBidsForGig
} from "../controllers/bid.controller.js";

const router = express.Router();

router.post("/", protect, createBid);
router.get("/:gigId", protect, getBidsForGig);

export default router;
