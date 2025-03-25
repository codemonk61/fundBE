import express from "express";
import Villager from "../models/villagers.model";


const router = express.Router();

// Add a villager
router.post("/add", async (req, res) => {
   
    try {

        const { name, amount, address, mobileNumber, sweetGiven, paymentStatus, paymentType } = req.body;
        const newVillager = new Villager({ name, amount, address, mobileNumber, sweetGiven, paymentStatus, paymentType});
        await newVillager.save();
        res.status(201).json({ success: true, message: "Villager added successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding villager", error });
    }
});

// Get all villagers
router.get("/", async (req, res) => {
    try {
        const villagers = await Villager.find();
        res.status(200).json(villagers);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching villagers", error });
    }
});

// Get  villager by ID
router.get("/user/:id", async (req, res) => {
  
    try {
        const villager = await Villager.findById(req.params.id);
        res.status(200).json(villager);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching villagers", error });
    }
});

// search villagers by name or mobile
router.get("/search", async (req, res) => {

    try {

        const name = req.query.name as string | undefined;
        const mobileNumber = req.query.mobileNumber as string | undefined;

        let query: { name?: { $regex: RegExp } | string; mobileNumber?: string } = {};

        if (name) {
            query.name = { $regex: new RegExp(name, "i") }; // Case-insensitive search
        }

        if (mobileNumber) {
            query.mobileNumber = mobileNumber;
        }

        const villagers = await Villager.find(query);

        if (villagers.length === 0) {
            res.status(404).json({ message: "Not found" });
        } else {
            res.status(200).json(villagers);
        }


    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching villagers", error });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        await Villager.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User deleted!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating record." });
    }
});

// Update user status
router.put("/:id", async (req, res) => {
    try {
         await Villager.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true, message: `user updated!` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating payment status." });
    }
});

// API to get expense data
router.get("/getExpense", async (req, res) => {
    try {
        const totalUsers = await Villager.countDocuments();
        const sweetGiven = await Villager.countDocuments({ sweetGiven: true });
        const paymentPending = await Villager.countDocuments({ paymentStatus: "pending" });
        const paymentCompleted = await Villager.countDocuments({ paymentStatus: "completed" });

        const sweetGivenUser = await Villager.find({ sweetGiven: true });
        const paymentPendingUser = await Villager.find({ paymentStatus: "pending" });
        const paymentCompletedUser = await Villager.find({ paymentStatus: "completed" });
        const villagers = await Villager.find();

        const response = [
            { count: totalUsers, title: "Total User", data: villagers},
            { count: sweetGiven, title: "Sweet Given", data: sweetGivenUser},
            { count: paymentPending, title: "Payment Pending", data: paymentPendingUser },
            { count: paymentCompleted, title: "Payment Completed", data: paymentCompletedUser },
        ];

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
