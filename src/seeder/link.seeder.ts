require('dotenv').config();
import mongoose from "mongoose";
import logger from "../config/logger";
import { fakerID_ID as faker } from "@faker-js/faker";
import { Link } from "../models/link.schema";
import { User } from "../models/user.schema";
import { Product } from "../models/product.schema";
import { randomInt } from "crypto";

// ? https://www.phind.com/search?cache=a2g4i4hs6b3z36qrktxbvu8t
mongoose.connect(`mongodb+srv://tataran:${process.env.MONGO_PASSWORD}@nodeadmin.yjvkzpx.mongodb.net/node_ambassador?retryWrites=true&w=majority`).then(async () => {
    const users = await User.find();
    const products = await Product.find();

    for (let i = 0; i < 30; i++) {
        const links = await Link.create({
            code: faker.string.alphanumeric(7),
            user_id: users[i % users.length].id,
            price: parseInt(faker.commerce.price({ min: 10000, max: 500000, dec: 0 })),
            products: [],
            orders: []
        })

        for (let j = 0; j < randomInt(1, 5); j++) {
            await Link.findByIdAndUpdate(links, {
                $push: { products: products[j]._id }
            });
        }
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err);
})