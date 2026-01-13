import mongoose from "mongoose";
import Gig from "../models/Gig.js";
import Bid from "../models/Bid.js";
import { io } from "../../server.js";

export const createBid = async (req, res) => {
    try {
        const { gigId, message, price } = req.body;

        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({ message: "Gig not found" });
        }

        if (gig.status !== "open") {
            return res.status(400).json({ message: "Gig is not open" });
        }

        if (gig.ownerId.toString() === req.user._id.toString()) {
            return res.status(403).json({ message: "Cannot bid on own gig" });
        }

        const bid = await Bid.create({
            gigId,
            freelancerId: req.user._id,
            message,
            price
        });

        res.status(201).json(bid);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBidsForGig = async (req, res) => {
    try {
        const { gigId } = req.params;

        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({ message: "Gig not found" });
        }

        // Only allow owner to see bids
        if (gig.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const bids = await Bid.find({ gigId })
            .populate("freelancerId", "name email");

        res.json(bids);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const hireBid = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const bid = await Bid.findById(req.params.bidId).session(session);
        if (!bid) {
            throw new Error("Bid not found");
        }

        const gig = await Gig.findById(bid.gigId).session(session);
        if (!gig) {
            throw new Error("Gig not found");
        }

        // Authorization check
        if (gig.ownerId.toString() !== req.user._id.toString()) {
            throw new Error("Not authorized to hire");
        }

        // Prevent double hiring
        if (gig.status !== "open") {
            throw new Error("Gig already assigned");
        }

        // 1️⃣ Assign gig
        gig.status = "assigned";
        await gig.save({ session });

        // 2️⃣ Hire selected bid
        bid.status = "hired";
        await bid.save({ session });

        // 3️⃣ Reject all other bids
        await Bid.updateMany(
            { gigId: gig._id, _id: { $ne: bid._id } },
            { status: "rejected" },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        // Emit event after successful commit
        io.to(bid.freelancerId.toString()).emit("hired", {
            gigTitle: gig.title,
            gigId: gig._id
        });

        res.json({ message: "Freelancer hired successfully" });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        res.status(400).json({ message: error.message });
    }
};
