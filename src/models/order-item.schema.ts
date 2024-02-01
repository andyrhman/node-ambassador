import mongoose, { Schema, Document } from "mongoose";
import { OrderDocument } from "./order.schema";

export interface OrderItemDocument extends Document {
    _id: string;
    product_title: string;
    price: number;
    quantity: number;
    ambassador_revenue: number;
    admin_revenue: number;
    order: OrderDocument;
}

export const OrderItemSchema = new Schema({
    product_title: { type: String },
    price: { type: Number },
    quantity: { type: Number },
    ambassador_revenue: { type: Number },
    admin_revenue: { type: Number },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
})

export const OrderItem = mongoose.model<OrderItemDocument>('order_items', OrderItemSchema);