import mongoose from "mongoose";
import logger from "../config/logger";
import * as argon2 from 'argon2'
import { fakerID_ID as faker } from "@faker-js/faker";
import { User } from "../models/user.schema";

mongoose.connect(`mongodb+srv://tataran:${process.env.MONGO_PASSWORD}@nodeadmin.yjvkzpx.mongodb.net/node_ambassador?retryWrites=true&w=majority`).then(async () => {
    const password = await argon2.hash("123123");

    for (let i = 0; i < 30; i++) {
        await User.create({
            fullName: faker.person.fullName(),
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password,
            is_ambassador: true
        })
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error("❌ Error during Data Source initialization:", err);
})