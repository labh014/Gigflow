import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
    createGig,
    getGigs
} from "../controllers/gig.controller.js";

const router = express.Router();

router.get("/", getGigs);
router.post("/", protect, createGig);

export default router;
