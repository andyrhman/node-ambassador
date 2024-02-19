require("dotenv").config();

import logger from "../config/logger";
import mongoose from "mongoose";
import { User } from "../models/user.schema";
import { createClient } from "redis";
import { Order } from "../models/order.schema";
require('../models/order.schema');
require('../models/order-item.schema');

mongoose
  .connect("mongodb://localhost/node_ambassador")
  .then(async () => {
    const client = createClient({
      url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@redis-14459.c252.ap-southeast-1-1.ec2.cloud.redislabs.com:14459`,
    });

    await client.connect();

    const ambassadors = await User.find({ is_ambassador: true });

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
      const orders = await Order.find({
        user_id: ambassadors[i]._id,
        complete: true,
      }).populate("order_items");

      const revenue = orders.reduce((s, o) => s + o.ambassador_revenue, 0);

      await client.zAdd("rankings", {
        value: ambassadors[i].fullName,
        score: revenue,
      });
    }

    logger.info("🌱 Seeding has been completed");
    process.exit(0);
  })
  .catch((err) => {
    logger.error(err);
  });
