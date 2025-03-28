"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
// Import the database connection
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const villagers_routes_1 = __importDefault(require("./routes/villagers.routes"));
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
dotenv_1.default.config();
(0, db_1.default)(); // Connect to MongoDB
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/villagers", villagers_routes_1.default);
app.use("/api/villagers/expenses", expense_routes_1.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
