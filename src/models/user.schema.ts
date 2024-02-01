import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
    _id: string;
    fullName: string;
    username: string;
    email: string;
    password: string;
    is_ambassador: boolean;
}

export const UserSchema = new Schema({
    fullName: { type: String },
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String, select: false },
    is_ambassador: { type: Boolean, default: false }
})

export const User = mongoose.model<UserDocument>('User', UserSchema)