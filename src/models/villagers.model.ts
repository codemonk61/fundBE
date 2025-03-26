import mongoose, { Schema, Document } from "mongoose";

//user schema type
export interface IVillager extends Document {
    name: string;
    address: string;
    mobileNumber: string;
    sweetGiven: boolean;
    paymentStatus: "pending" | "completed";
    paymentType: 'cash' | 'online'
}


//schema for user
const VillagerSchema: Schema = new Schema({
    name: { type: String, required: false },
    amount: { type: String, required: false },
    address: { type: String, required: false },
    mobileNumber: { type: String, required: false },
    sweetGiven: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ["pending", "completed"], default: "pending" },
    paymentType: { type: String,  enum: ["cash", "online"], default: 'cash' },
});



export default mongoose.model<IVillager>("Villager", VillagerSchema);
