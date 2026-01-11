import Gig from "../models/Gig.js";

export const createGig = async (req, res) => {
    try {
        const { title, description, budget } = req.body;

        const gig = await Gig.create({
            title,
            description,
            budget,
            ownerId: req.user._id
        });

        res.status(201).json(gig);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getGigs = async (req, res) => {
    try {
        const { search } = req.query;

        let filter = { status: "open" };

        if (search) {
            filter.title = { $regex: search, $options: "i" };
        }

        const gigs = await Gig.find(filter)
            .populate("ownerId", "name");

        res.json(gigs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
