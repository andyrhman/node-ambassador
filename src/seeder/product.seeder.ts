import mongoose from "mongoose";
import logger from "../config/logger";
import { fakerID_ID as faker } from "@faker-js/faker";
import { Product } from "../models/product.schema";

mongoose.connect('mongodb://localhost/node_ambassador').then(async () => {

    for (let i = 0; i < 30; i++) {
        await Product.create({
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            image: faker.image.urlLoremFlickr({ width: 200, height: 200, category: 'food' }),
            price: parseInt(faker.commerce.price({ min: 100000, max: 5000000, dec: 0 }))
        })
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error("❌ Error during Data Source initialization:", err);
})