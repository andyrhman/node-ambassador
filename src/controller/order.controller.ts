import { Request, Response } from "express";
import myDataSource from "../config/db.config";
import { Order } from "../entity/order.entity";
import logger from "../config/logger";
import { Link } from "../entity/link.entity";
import { Product } from "../entity/product.entity";
import { OrderItem } from "../entity/order-item.entity";

export const Orders = async (req: Request, res: Response) => {
    try {
        const orders = await myDataSource.getRepository(Order).find({
            where: {
                complete: true
            },
            relations: ['order_items']
        })

        res.send(orders.map((order: Order) => {
            return {
                id: order.id,
                name: order.fullName,
                email: order.email,
                total: order.total,
                created_at: order.created_at,
                order_items: order.order_items
            }
        }));
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const CreateOrder = async (req: Request, res: Response) => {
    const body = req.body;

    const link = await myDataSource.getRepository(Link).findOne({
        where: { code: body.code },
        relations: ['user']
    });

    if (!link) {
        return res.status(400).send({ message: "Invalid Code" })
    }

    const queryRunner = myDataSource.createQueryRunner();
    
    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        let order = new Order();
        order.user_id = link.user.id;
        order.code = body.code;
        order.ambassador_email = link.user.email;
        order.fullName = body.fullName;
        order.email = body.email;
        order.address = body.address;
        order.country = body.country;
        order.city = body.city;
        order.zip = body.zip;

        // ? Query runner alrady know we are inserting this order
        // ? in the order table because we declare the variable like this
        // ? let order = new Order();
        order = await queryRunner.manager.save(order);

        for (let p of body.products) {
            const product = await myDataSource.getRepository(Product).findOne({
                where: { id: p.product_id }
            });

            let orderItem = new OrderItem();
            orderItem.order = order;
            orderItem.product_title = product.title;
            orderItem.price = product.price;
            orderItem.quantity = p.quantity;
            orderItem.ambassador_revenue = Math.round(0.1 * product.price * p.quantity);
            orderItem.admin_revenue = Math.round(0.9 * product.price * p.quantity);

            await queryRunner.manager.save(orderItem);
        }

        await queryRunner.commitTransaction();

        res.send(order)
    } catch (error) {
        await queryRunner.rollbackTransaction();
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}