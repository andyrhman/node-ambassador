import { Request, Response } from "express"
import { verify } from "jsonwebtoken";
import myDataSource from "../config/db.config";
import { User } from "../entity/user.entity";
import logger from "../config/logger";

export const AuthMiddleware = async (req: Request, res: Response, next: Function) => {
    try {
        const jwt = req.cookies["user_session"];

        const payload: any = verify(jwt, process.env.JWT_SECRET_ACCESS);

        if (!payload) {
            return res.status(401).send({ message: "Unauthenticated" })
        }

        // ? check if ambassdor by using the ambassador endpoints
        const is_ambassador = req.path.indexOf('api/ambassador') >= 0;

        const user = await myDataSource.getRepository(User).findOne({ where: { id: payload.id } });

        if ((is_ambassador && payload.scope !== 'ambassador') || (!is_ambassador && payload.scope !== 'admin')) {
            return res.status(403).send({ message: "Unauthorized" })
        }

        req["user"] = user
        next();
    } catch (error) {
        return res.status(400).send({ message: "Invalid Request" })
    }
}