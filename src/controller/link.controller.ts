import { Request, Response } from "express";
import { Link } from "../entity/link.entity";
import logger from "../config/logger";
import myDataSource from "../config/db.config";
import { Order } from "../entity/order.entity";

export const Links = async (req: Request, res: Response) => {
    try {
        const links = await myDataSource.getRepository(Link).find({
            where: { user_id: req.params.id },
            relations: ['orders', 'orders.order_items']
        })

        res.send(links)
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const CreateLink = async (req: Request, res: Response) => {
    try {
        const user = req['user']
        const link = await myDataSource.getRepository(Link).save({
            user,
            code: Math.random().toString(36).substring(6),
            products: req.body.products.map((id: any) => {
                return {
                    id: id
                }
            })
        });

        res.send(link);
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const Stats = async (req: Request, res: Response) => {
    try {
        const user = req["user"];

        const links: Link[] = await myDataSource.getRepository(Link).find({
            where: { user },
            relations: ['orders', 'orders.order_items']
        });

        res.send(links.map(link => {
            const orders: Order[] = link.orders.filter(o => o.complete)

            return{
                code: link.code,
                count: orders.length,
                revenue: orders.reduce((s, o) => s + o.ambassador_revenue, 0)
            }
        }))
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}