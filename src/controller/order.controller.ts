import { Request, Response } from "express";
import myDataSource from "../config/db.config";
import { Order } from "../entity/order.entity";
import { Link } from "../entity/link.entity";
import { Product } from "../entity/product.entity";
import { OrderItem } from "../entity/order-item.entity";
import { User } from "../entity/user.entity";
import { client } from "..";
import logger from "../config/logger";
import Stripe from "stripe";
import transporter from "../config/transporter";
import * as fs from 'fs';
import * as handlebars from 'handlebars';

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

        const line_items = [];

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

            line_items.push({
                price_data: {
                    currency: 'idr',
                    unit_amount: product.price,
                    product_data: {
                        name: product.title,
                        description: product.description,
                        images: [
                            product.image
                        ]
                    },
                },
                quantity: p.quantity
            })
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET, {
            apiVersion: '2023-10-16'
        });

        const source = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            success_url: `${process.env.CHECKOUT_URL}/success?source={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CHECKOUT_URL}/error`
        })

        order.transaction_id = source['id'];
        await queryRunner.manager.save(order);

        await queryRunner.commitTransaction();

        res.send(source)
    } catch (error) {
        await queryRunner.rollbackTransaction();
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const ConfirmOrder = async (req: Request, res: Response) => {
    try {
        const repository = myDataSource.getRepository(Order);

        const order = await repository.findOne({
            where: { transaction_id: req.body.source },
            relations: ['order_items']
        });

        if (!order) {
            return res.status(400).send({ message: "Invalid Request" })
        }

        await repository.update(order.id, { complete: true });

        const user = await myDataSource.getRepository(User).findOne({
            where: { id: order.user_id }
        });

        await client.zIncrBy('rankings', order.ambassador_revenue, user.fullName);

        // ? https://www.phind.com/search?cache=lk6d4xezo7ag6qha2hoi70i5
        const adminSource = fs.readFileSync('src/templates/admin-order.handlebars', 'utf-8').toString();
        const ambassadorSource = fs.readFileSync('src/templates/ambassador-order.handlebars', 'utf-8').toString();
        const adminTemplate = handlebars.compile(adminSource);
        const ambassadorTemplate = handlebars.compile(ambassadorSource);
        const adminReplacement = {
            orderId: order.id,
            orderTotal: `Rp${new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(order.total / 1000)}`
        };
        const ambassadorReplacement = {
            ambassadorRevenue: `Rp${new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(order.ambassador_revenue / 1000)}`,
            orderCode: order.code
        };
        const sendToAdmin = adminTemplate(adminReplacement);
        const sendToAmbassador = ambassadorTemplate(ambassadorReplacement);

        const optionsAdmin = {
            from: 'service@mail.com',
            to: 'admin@admin.com',
            subject: "An order has been completed",
            html: sendToAdmin
        }

        const optionsAmbassador = {
            from: 'service@mail.com',
            to: order.ambassador_email,
            subject: "An order has been completed",
            html: sendToAmbassador
        }

        await transporter.sendMail(optionsAdmin);
        await transporter.sendMail(optionsAmbassador);

        res.status(202).send({
            message: "Your order has been successfully completed"
        })
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}