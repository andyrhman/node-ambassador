import { Request, Response } from "express";
import { Link } from "../entity/link.entity";
import logger from "../config/logger";
import myDataSource from "../config/db.config";
import { Order } from "../entity/order.entity";
import { User } from "../entity/user.entity";
import { client } from "../index";

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
            /*
                * This code has different implementation as in nestjs ambassador
                * in nestjs we count directly the ambassador revenue in the entity like this
                ?   get revenue(): number {
                ?        return this.orders.filter(o => o.complete).reduce((s, o) => s + o.ambassador_revenue, 0)
                ?   }
    
                * but for this project we count the revenue inside the controller
                * use this alternative if you don't want to use the nestjs one
            */
            const orders: Order[] = link.orders.filter(o => o.complete)

            return {
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

export const Rankings = async (req: Request, res: Response) => {
    try {
        const result: string[] = await client.sendCommand(['ZREVRANGEBYSCORE', 'rankings', '+inf', '-inf', 'WITHSCORES']);

        const rankings = {};
        for (let i = 0; i < result.length; i += 2) {
            const name = result[i];
            const score = parseInt(result[i + 1]);
            rankings[name] = score;
        }

        res.send(rankings);

        /*
        * BUG VERSION
        ?    let name;
        
        ?    res.send(result.reduce((o, r) => {
        ?        if (isNaN(parseInt(r))) {
        ?            name = r;
        ?            return o;
        ?        } else {
        ?            return {
        ?                ...o,
        ?                [name]: parseInt(r)
        ?            };
        ?        }
        ?    }, {}));
        
        */
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const GetLink = async (req: Request, res: Response) => {
    try {
        res.send(await myDataSource.getRepository(Link).findOne({
            where: { code: req.params.code },
            relations: ['user', 'products']
        }));
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}