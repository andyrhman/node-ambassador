import seederSource from "../config/seeder.comfig";
import logger from "../config/logger";
import * as argon2 from 'argon2'
import { fakerID_ID as faker } from "@faker-js/faker";
import { User } from "../entity/user.entity";

seederSource.initialize().then(async () => {
    const repository = seederSource.getRepository(User);

    const password = await argon2.hash("123123");

    for (let i = 0; i < 30; i++) {
        await repository.save({
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