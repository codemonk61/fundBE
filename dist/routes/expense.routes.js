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
const expenses_model_1 = __importDefault(require("../models/expenses.model"));
const villagers_model_1 = __importDefault(require("../models/villagers.model"));
const router = (0, express_1.Router)();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield expenses_model_1.default.insertMany(req.body); // Correct way to insert an array of expenses
        res.status(201).json({ success: true, message: "Expenses added successfully!" });
    }
    catch (e) {
        console.error("Error adding expenses:", e);
        res.status(500).json({ success: false, message: "Expenses error!" });
    }
}));
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const villagers = yield villagers_model_1.default.find();
        let totalAmountCollected = villagers.reduce((sum, villager) => {
            return sum + (parseFloat(villager.amount) || 0); // Convert amount to number and sum up
        }, 0);
        const expenses = yield expenses_model_1.default.find();
        let totalExpenses = expenses.reduce((sum, exp) => {
            return sum + (parseFloat(exp.expenseAmount) || 0); // Convert amount to number and sum up
        }, 0);
        let remainingAmount = totalAmountCollected - totalExpenses;
        res.status(200).json({
            itemExpenses: expenses,
            subTotal: [
                { name: "Total Collected Amount", expenseAmount: totalAmountCollected },
                { name: "Total Expenses", expenseAmount: totalExpenses },
                { name: "Remaining Amount", expenseAmount: remainingAmount },
            ]
        });
    }
    catch (e) {
        res.status(500).json({ success: false, message: "expenses  error!" });
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedExpense = yield expenses_model_1.default.findByIdAndDelete(id);
        if (!deletedExpense) {
            return res.status(404).json({ success: false, message: "Expense not found!" });
        }
        res.status(200).json({ success: true, message: "Expense deleted successfully!" });
    }
    catch (e) {
        res.status(500).json({ success: false, message: "Error deleting expense!" });
    }
}));
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, expenseAmount } = req.body;
        const updatedExpense = yield expenses_model_1.default.findByIdAndUpdate(id, { name, expenseAmount }, { new: true, runValidators: true });
        if (!updatedExpense) {
            return res.status(404).json({ success: false, message: "Expense not found!" });
        }
        res.status(200).json({ success: true, message: "Expense updated successfully!", data: updatedExpense });
    }
    catch (e) {
        console.error("Error updating expense:", e);
        res.status(500).json({ success: false, message: "Error updating expense!" });
    }
}));
exports.default = router;
