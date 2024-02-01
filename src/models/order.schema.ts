import mongoose, { Schema, Document } from "mongoose";
import { OrderItemDocument } from "./order-item.schema";
import { LinkDocument } from "./link.schema";

export interface OrderDocument extends Document {
    _id: string;
    transaction_id: string;
    user_id: mongoose.Schema.Types.ObjectId;
    code: string;
    ambassador_email: string;
    fullName: string;
    email: string;
    address: string;
    country: string;
    city: string;
    zip: string;
    complete: boolean;
    created_at: Date;
    order_items: OrderItemDocument[];
    links: LinkDocument;
}

export const OrderSchema = new Schema<OrderDocument>({
    transaction_id: { type: String, nullable: true },
    user_id: { type: mongoose.Schema.Types.ObjectId },
    code: { type: String },
    ambassador_email: { type: String },
    fullName: { type: String },
    email: { type: String },
    address: { type: String, nullable: true },
    country: { type: String, nullable: true },
    city: { type: String, nullable: true },
    zip: { type: String, nullable: true },
    complete: { type: Boolean, default: false },
    order_items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'order_items' }],
    links: { type: mongoose.Schema.Types.ObjectId, ref: 'Link' }
}, {
    timestamps: {
        createdAt: 'created_at'
    },
    virtuals: {
        total: {
            get(): number {
                return this.order_items.reduce((sum, i) => sum + i.admin_revenue, 0);
            }
        },
        ambassador_revenue: {
            get(): number {
                return this.order_items.reduce((sum, i) => sum + i.ambassador_revenue, 0);
            }
        }
    },
    toJSON: { virtuals: true }
}
);

export const Order = mongoose.model<OrderDocument>('Order', OrderSchema)