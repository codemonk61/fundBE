import mongoose, { Schema, Document } from "mongoose";

const ExpensesModel: Schema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    expenseAmount: {
        type: Number,
        required: false
    }
})

export default mongoose.model("ExpensesModel", ExpensesModel)