import mongoose, { Schema, Document } from "mongoose";

export interface ProductDocument extends Document {
    _id: string;
    title: string;
    description: string;
    image: string;
    price: number;
}

export const ProductSchema = new Schema({
    title: { type: String },
    description: { type: String },
    image: { type: String },
    price: { type: Number }
})

export const Product = mongoose.model<ProductDocument>("Product", ProductSchema)