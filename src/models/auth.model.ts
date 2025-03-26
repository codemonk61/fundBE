import mongoose, { Schema, Document } from "mongoose";

export interface IAuth extends Document {
    name: string;
    emailId: string;
    securityCode: string;
    password: string;
}

const AuthSchema: Schema = new Schema({
    name: { type: String, required: true },
    emailId: { type: String, required: true, unique: true },
    securityCode: { type: String, required: true },
    password: { type: String, required: true }
});

export default mongoose.model<IAuth>("Auth", AuthSchema);

 