import seederSource from "../config/seeder.comfig";
import logger from "../config/logger";
import { fakerID_ID as faker } from "@faker-js/faker";
import { Link } from "../entity/link.entity";
import { User } from "../entity/user.entity";

seederSource.initialize().then(async () => {
    const repository = seederSource.getRepository(Link);

    const users = await seederSource.getRepository(User).find({});

    for (let i = 0; i < 30; i++) {
        await repository.save({
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