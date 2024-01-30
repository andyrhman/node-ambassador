import { Request, Response } from "express";
import { Link } from "../entity/link.entity";
import logger from "../config/logger";
import myDataSource from "../config/db.config";

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
            user: user,
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