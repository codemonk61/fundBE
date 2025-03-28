import express, { Router } from 'express'
import ExpensesModel from '../models/expenses.model';
import villagersModel from '../models/villagers.model';

const router = Router();

router.post("/", async (req, res) => {
    try {
        await ExpensesModel.insertMany(req.body); // Correct way to insert an array of expenses
        res.status(201).json({ success: true, message: "Expenses added successfully!" });
    } catch (e) {
        console.error("Error adding expenses:", e);
        res.status(500).json({ success: false, message: "Expenses error!" });
    }
});


router.get("/", async (req, res) => {


    try {
        const villagers = await villagersModel.find();
        let totalAmountCollected = villagers.reduce((sum, villager) => {
            return sum + (parseFloat(villager.amount) || 0); // Convert amount to number and sum up
        }, 0);

        const expenses = await ExpensesModel.find();
    
        let totalExpenses = expenses.reduce((sum, exp: any) => {
            return sum + (parseFloat(exp.expenseAmount) || 0); // Convert amount to number and sum up
        }, 0);

        let remainingAmount = totalAmountCollected - totalExpenses;

        res.status(200).json(
            {
                itemExpenses: expenses,
                subTotal:   [
                    {name: "Total Collected Amount", expenseAmount: totalAmountCollected},
                    {name: "Total Expenses", expenseAmount: totalExpenses},
                    {name: "Remaining Amount", expenseAmount: remainingAmount},
                 ]
            }
          
        );
        
    } catch (e) {
        res.status(500).json({ success: false, message: "expenses  error!" })
    }

})

router.delete("/:id", async (req, res): Promise<any> => {
    try {
        const { id } = req.params;
        const deletedExpense = await ExpensesModel.findByIdAndDelete(id);

        if (!deletedExpense) {
            return res.status(404).json({ success: false, message: "Expense not found!" });
        }

        res.status(200).json({ success: true, message: "Expense deleted successfully!" });
    } catch (e) {
        res.status(500).json({ success: false, message: "Error deleting expense!" });
    }
});

router.put("/:id", async (req, res): Promise<any> => {
    try {
        const { id } = req.params;
        const { name, expenseAmount } = req.body;

        const updatedExpense = await ExpensesModel.findByIdAndUpdate(
            id,
            { name, expenseAmount },
            { new: true, runValidators: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({ success: false, message: "Expense not found!" });
        }

        res.status(200).json({ success: true, message: "Expense updated successfully!", data: updatedExpense });
    } catch (e) {
        console.error("Error updating expense:", e);
        res.status(500).json({ success: false, message: "Error updating expense!" });
    }
});



export default router;