import mongoose, { Schema, Document } from "mongoose";

export interface IVillager extends Document {
    name: string;
    address: string;
    mobileNumber: string;
    sweetGiven: boolean;
    paymentStatus: "pending" | "completed";
    paymentType: 'cash' | 'online'
}

const VillagerSchema: Schema = new Schema({
    name: { type: String, required: false },
    amount: { type: String, required: false },
    address: { type: String, required: false },
    mobileNumber: { type: String, required: false },
    sweetGiven: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ["pending", "completed"], default: "pending" },
    paymentType: { type: Boolean, default: false },
});

export default mongoose.model<IVillager>("Villager", VillagerSchema);
