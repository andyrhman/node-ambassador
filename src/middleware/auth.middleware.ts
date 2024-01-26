import { Request, Response } from "express"
import { verify } from "jsonwebtoken";
import myDataSource from "../config/db.config";
import { User } from "../entity/user.entity";
import logger from "../config/logger";

export const AuthMiddleware = async (req: Request, res: Response, next: Function) => {
    try {
        const jwt = req.cookies["user_session"];

        const payload: any = verify(jwt, process.env.JWT_SECRET_ACCESS);

        req["user"] = await myDataSource.getRepository(User).findOne({ where: { id: payload.id } });

        next();
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send({ message: "Invalid Request" })
    }
}