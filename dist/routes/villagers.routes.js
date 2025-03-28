"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const villagers_model_1 = __importDefault(require("../models/villagers.model"));
// Your WhatsApp Cloud API Credentials
const WHATSAPP_TOKEN = "YOUR_ACCESS_TOKEN"; // Replace with your actual token
const PHONE_NUMBER_ID = "YOUR_PHONE_NUMBER_ID"; // Replace with your actual phone number ID
const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
// Function to send a WhatsApp message
function sendWhatsAppMessage(phoneNumber, message) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield axios_1.default.post(WHATSAPP_API_URL, {
                messaging_product: "whatsapp",
                to: phoneNumber,
                type: "text",
                text: { body: message },
            }, {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json",
                },
            });
            console.log("WhatsApp message sent:", response.data);
        }
        catch (error) {
            console.error("Error sending WhatsApp message:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        }
    });
}
const router = express_1.default.Router();
// Add a villager
router.post("/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, amount, address, mobileNumber, sweetGiven, paymentStatus, paymentType } = req.body;
        const newVillager = new villagers_model_1.default({ name, amount, address, mobileNumber, sweetGiven, paymentStatus, paymentType });
        yield newVillager.save();
        res.status(201).json({ success: true, message: "Villager added successfully!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error adding villager", error });
    }
}));
// Get all villagers
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const villagers = yield villagers_model_1.default.find();
        res.status(200).json(villagers);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching villagers", error });
    }
}));
// Get  villager by ID
router.get("/user/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const villager = yield villagers_model_1.default.findById(req.params.id);
        res.status(200).json(villager);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching villagers", error });
    }
}));
// search villagers by name or mobile
router.get("/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = req.query.name;
        const mobileNumber = req.query.mobileNumber;
        let query = {};
        if (name) {
            query.name = { $regex: new RegExp(name, "i") }; // Case-insensitive search
        }
        if (mobileNumber) {
            query.mobileNumber = mobileNumber;
        }
        const villagers = yield villagers_model_1.default.find(query);
        if (villagers.length === 0) {
            res.status(404).json({ message: "Not found" });
        }
        else {
            res.status(200).json(villagers);
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching villagers", error });
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield villagers_model_1.default.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User deleted!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error updating record." });
    }
}));
// Update villager status
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield villagers_model_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Update the user
        yield villagers_model_1.default.findByIdAndUpdate(req.params.id, req.body);
        // Check if sweetGiven is true and send WhatsApp message
        if (req.body.sweetGiven === true && user.mobileNumber) {
            const message = `🎉 Hello ${user.name}, thank you for receiving the sweets! Have a great day! 🎊`;
            yield sendWhatsAppMessage(user.mobileNumber, message);
        }
        res.json({ success: true, message: `User updated!` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error updating payment status." });
    }
}));
// API to get expense data
router.get("/getExpense", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalUsers = yield villagers_model_1.default.countDocuments();
        const sweetGiven = yield villagers_model_1.default.countDocuments({ sweetGiven: true });
        const paymentPending = yield villagers_model_1.default.countDocuments({ paymentStatus: "pending" });
        const paymentCompleted = yield villagers_model_1.default.countDocuments({ paymentStatus: "completed" });
        const sweetGivenUser = yield villagers_model_1.default.find({ sweetGiven: true });
        const paymentPendingUser = yield villagers_model_1.default.find({ paymentStatus: "pending" });
        const paymentCompletedUser = yield villagers_model_1.default.find({ paymentStatus: "completed" });
        const villagers = yield villagers_model_1.default.find();
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
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
