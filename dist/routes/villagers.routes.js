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
const villagers_model_1 = __importDefault(require("../models/villagers.model"));
const router = express_1.default.Router();
// Add a villager
router.post("/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    try {
        const { name, amount, address, mobileNumber, sweetGiven, paymentStatus } = req.body;
        const newVillager = new villagers_model_1.default({ name, amount, address, mobileNumber, sweetGiven, paymentStatus });
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
    console.log(req.params.id);
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
// Update user status
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield villagers_model_1.default.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true, message: `user updated!` });
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
        const amount = yield villagers_model_1.default.countDocuments({ amount: "" });
        const response = [
            { count: totalUsers, title: "Total User" },
            { count: sweetGiven, title: "Sweet Given" },
            { count: paymentPending, title: "Payment Pending" },
            { count: paymentCompleted, title: "Payment Completed" },
        ];
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
