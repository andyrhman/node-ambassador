import mongoose from "mongoose";
import logger from "../config/logger";
import { fakerID_ID as faker } from "@faker-js/faker";
import { Link } from "../models/link.schema";
import { User } from "../models/user.schema";

mongoose.connect('mongodb://localhost/node_ambassador').then(async () => {
    const users = await User.find();

    for (let i = 0; i < 30; i++) {
        await Link.create({
            code: faker.string.alphanumeric(7),
            user_id: users[i % users.length].id,
            price: parseInt(faker.commerce.price({ min: 10000, max: 500000, dec: 0 }))
        })
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err.message);
})