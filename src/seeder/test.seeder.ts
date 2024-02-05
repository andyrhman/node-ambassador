import mongoose from "mongoose";
import logger from "../config/logger";
import * as argon2 from 'argon2'
import { fakerID_ID as faker } from "@faker-js/faker";
import { Order } from "../models/order.schema";
import { OrderItem } from "../models/order-item.schema";
import { User } from "../models/user.schema";
import { randomInt } from "crypto";
import { Link } from "../models/link.schema";

//? https://www.phind.com/search?cache=dcfe140zyh37cwu8jfucueb4
mongoose.connect('mongodb://localhost/node_ambassador').then(async () => {
    const link = await Link.find();
    const password = await argon2.hash("123123");

    for (let i = 0; i < 30; i++) {
        const user = await User.create({
            fullName: faker.person.fullName(),
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password,
            is_ambassador: true,
            orders: []
        })

        const order = await Order.create({
            code: faker.string.alphanumeric(7),
            ambassador_email: faker.internet.email(),
            user_id: user._id,
            fullName: faker.person.fullName(),
            email: faker.internet.email(),
            address: faker.location.streetAddress({ useFullAddress: true }),
            country: faker.location.country(),
            city: faker.location.city(),
            zip: faker.location.zipCode(),
            links: link[i].id,
            order_items: [],
            complete: true
        })

        for (let j = 0; j < randomInt(1, 5); j++) {
            const orderItem = await OrderItem.create({
                order: order,
                product_title: faker.commerce.productName(),
                price: parseInt(faker.commerce.price({ min: 100000, max: 5000000, dec: 0 })),
                quantity: randomInt(1, 5),
                ambassador_revenue: randomInt(10000, 500000),
                admin_revenue: randomInt(1000, 50000),
            })
            order.order_items.push(orderItem)
        }

        await order.save();

        await User.findByIdAndUpdate(user._id, { $push: { orders: order } });
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err);
})
