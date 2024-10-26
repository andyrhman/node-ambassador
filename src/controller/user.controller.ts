import { Request, Response } from "express";
import myDataSource from "../config/db.config";
import { User } from "../entity/user.entity";
import logger from "../config/logger";

export const Ambassadors = async (req: Request, res: Response) => {
    try {
        const users = await myDataSource.getRepository(User).find({
            where: {
                is_ambassador: true
            }
        });
        res.send({ users });
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" });
    }
};