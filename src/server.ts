import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
 // Import the database connection
 import authRoutes from "./routes/auth.routes";
import villagerRoute from "./routes/villagers.routes"

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/villagers", villagerRoute)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
