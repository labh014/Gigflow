import Gig from "../models/Gig.js";
import Bid from "../models/Bid.js";

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
