import express from "express";
import axios from 'axios'
import Villager, { IVillager } from "../models/villagers.model";

// Your WhatsApp Cloud API Credentials
const WHATSAPP_TOKEN = "YOUR_ACCESS_TOKEN"; // Replace with your actual token
const PHONE_NUMBER_ID = "YOUR_PHONE_NUMBER_ID"; // Replace with your actual phone number ID
const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

// Function to send a WhatsApp message
async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<void> {
    try {
        const response = await axios.post(
            WHATSAPP_API_URL,
            {
                messaging_product: "whatsapp",
                to: phoneNumber,
                type: "text",
                text: { body: message },
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("WhatsApp message sent:", response.data);
    } catch (error: any) {
        console.error("Error sending WhatsApp message:", error.response?.data || error.message);
    }
}



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

// Update villager status
router.put("/:id", async (req, res): Promise<any> => {
    try {
        const user = await Villager.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update the user
        await Villager.findByIdAndUpdate(req.params.id, req.body);

        // Check if sweetGiven is true and send WhatsApp message
        if (req.body.sweetGiven === true && user.mobileNumber) {
            const message = `🎉 Hello ${user.name}, thank you for receiving the sweets! Have a great day! 🎊`;
            await sendWhatsAppMessage(user.mobileNumber, message);
        }

        res.json({ success: true, message: `User updated!` });
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

        // Calculate total amount collected (convert string to number)
        let totalAmountCollected = villagers.reduce((sum, villager) => {
            return sum + (parseFloat(villager.amount) || 0); // Convert amount to number and sum up
        }, 0);

        const response = [
            { count: totalUsers, title: "Total User", data: villagers },
            { count: totalAmountCollected, title: "Total Amount Collected" }, // New key
            { count: sweetGiven, title: "Sweet Given", data: sweetGivenUser },
            { count: paymentPending, title: "Payment Pending", data: paymentPendingUser },
            { count: paymentCompleted, title: "Payment Completed", data: paymentCompletedUser },
        ];

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


export default router;
