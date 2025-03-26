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
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_model_1 = __importDefault(require("../models/auth.model"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "qwerty123";
// Signup Route
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, emailId, securityCode, password } = req.body;
    if (!name || !emailId || !securityCode || !password || !(securityCode === JWT_SECRET)) {
        res.status(400).json({ success: false, message: "All fields are required!" });
        return;
    }
    try {
        // Check if user already exists
        const existingUser = yield auth_model_1.default.findOne({ emailId });
        if (existingUser) {
            res.status(400).json({ success: false, message: "User already exists!" });
            return;
        }
        // Hash password before saving
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Create new user
        const newUser = yield auth_model_1.default.create({
            name,
            emailId,
            securityCode,
            password: hashedPassword,
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "3h" });
        res.status(201).json({ success: true, message: "Signup successful!", token });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Error in signup", error: err.message });
    }
}));
// Login Route
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailId, password } = req.body;
    if (!emailId || !password) {
        res.status(400).json({ success: false, message: "Email and password are required!" });
        return;
    }
    try {
        const user = yield auth_model_1.default.findOne({ emailId });
        if (!user) {
            res.status(400).json({ success: false, message: "Invalid credentials" });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "3h" });
        res.status(200).json({ success: true, message: "Login successful!", token });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Error in login", error: err.message });
    }
}));
exports.default = router;
