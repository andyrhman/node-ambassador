import mongoose, { Schema, Document } from "mongoose";
import { OrderDocument } from "./order.schema";

export interface UserDocument extends Document {
    _id: string;
    fullName: string;
    username: string;
    email: string;
    password: string;
    is_ambassador: boolean;
    orders: OrderDocument[];
    revenue: number;
}

export const UserSchema = new Schema<UserDocument>({
    fullName: { type: String },
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    is_ambassador: { type: Boolean, default: false },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, {
    virtuals: {
        revenue: {
            get(): number {
                return this.orders.filter(o => o.complete).reduce((s, o) => s + o.ambassador_revenue, 0)
            }
        }
    },
    toJSON: { virtuals: true }
}
)

export const User = mongoose.model<UserDocument>('User', UserSchema)