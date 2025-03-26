import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Auth from "../models/auth.model";

const router: Router = Router();
const JWT_SECRET: string = process.env.JWT_SECRET || "qwerty123";


// Signup Route
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
    const { name, emailId, securityCode, password } = req.body;


    if (!name || !emailId || !securityCode || !password || !(securityCode === JWT_SECRET)) {
        res.status(400).json({ success: false, message: "All fields are required!" });
        return;
    }

    try {
        // Check if user already exists
        const existingUser = await Auth.findOne({ emailId });
        if (existingUser) {
            res.status(400).json({ success: false, message: "User already exists!" });
            return;
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await Auth.create({
            name,
            emailId,
            securityCode,
            password: hashedPassword,
        });

        // Generate JWT token
        const token: string = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "3h" });

        res.status(201).json({ success: true, message: "Signup successful!", token });
    } catch (err: any) {
        res.status(500).json({ success: false, message: "Error in signup", error: err.message });
    }
});



// Login Route
router.post("/login", async (req: Request, res: Response): Promise<void> => {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
        res.status(400).json({ success: false, message: "Email and password are required!" });
        return;
    }

    try {
        const user = await Auth.findOne({ emailId });
        if (!user) {
            res.status(400).json({ success: false, message: "Invalid credentials" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: "Invalid credentials" });
            return;
        }

        const token: string = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "3h" });
        res.status(200).json({ success: true, message: "Login successful!", token });
    } catch (err: any) {
        res.status(500).json({ success: false, message: "Error in login", error: err.message });
    }
});

export default router;
