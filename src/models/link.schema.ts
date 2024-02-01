import mongoose, { Schema, Document } from "mongoose";
import { ProductDocument } from "./product.schema";
import { OrderDocument } from "./order.schema";

export interface LinkDocument extends Document {
    _id: string;
    code: string;
    user_id: mongoose.Schema.Types.ObjectId;
    products: ProductDocument[];
    orders: OrderDocument[];
}

export const LinkSchema = new Schema({
    code: { type: String },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
});

export const Link = mongoose.model<LinkDocument>("Link", LinkSchema)