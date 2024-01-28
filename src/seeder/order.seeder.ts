import seederSource from "../config/seeder.comfig";
import logger from "../config/logger";
import { fakerID_ID as faker } from "@faker-js/faker";
import { Order } from "../entity/order.entity";
import { OrderItem } from "../entity/order-item.entity";
import { User } from "../entity/user.entity";
import { randomInt } from "crypto";

seederSource.initialize().then(async () => {
    const orderRepository = seederSource.getRepository(Order);
    const orderItemRepository = seederSource.getRepository(OrderItem);
    const users = await seederSource.getRepository(User).find({});

    for (let i = 0; i < 30; i++) {
        const order = await orderRepository.save({
            code: faker.string.alphanumeric(7),
            ambassador_email: faker.internet.email(),
            user_id: users[i % users.length].id,
            fullName: faker.person.fullName(),
            email: faker.internet.email(),
            address: faker.location.streetAddress({ useFullAddress: true }),
            country: faker.location.country(),
            city: faker.location.city(),
            zip: faker.location.zipCode(),
            complete: true
        })

        for (let j = 0; j < randomInt(1, 5); j++) {
            await orderItemRepository.save({
                order: order,
                product_title: faker.commerce.productName(),
                price: parseInt(faker.commerce.price({ min: 100000, max: 5000000, dec: 0 })),
                quantity: randomInt(1, 5),
                ambassador_revenue: randomInt(10000, 500000),
                admin_revenue: randomInt(1000, 50000),
            })

        }
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err.message);
})