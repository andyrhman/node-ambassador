import seederSource from "../config/seeder.comfig";
import logger from "../config/logger";
import { User } from "../entity/user.entity";
import { createClient } from "redis";
import { Order } from "../entity/order.entity";

seederSource.initialize().then(async () => {
    const client = createClient({
        url: `redis://redis:6379`
    });

    await client.connect();

    const ambassadors = await seederSource.getRepository(User).find({
        where: { is_ambassador: true }
    });

    const orderRepository = seederSource.getRepository(Order);

    for (let i = 0; i < ambassadors.length; i++) {
        /*
            * This code has different implementation as in nestjs ambassador
            * in nestjs we count directly the ambassador revenue in the entity like this
            ?   get revenue(): number {
            ?        return this.orders.filter(o => o.complete).reduce((s, o) => s + o.ambassador_revenue, 0)
            ?   }

            * but for this project we count the revenue inside the controller
            * use this alternative if you don't want to use the nestjs one
        */
        const orders = await orderRepository.find({
            where: { user_id: ambassadors[i].id, complete: true },
            relations: ['order_items']
        });

        const revenue = orders.reduce((s, o) => s + o.ambassador_revenue, 0)

        await client.zAdd('rankings', {
            value: ambassadors[i].fullName,
            score: revenue
        })
    }

    logger.info("🌱 Seeding has been completed")
    process.exit(0);
}).catch((err) => {
    logger.error(err);
})