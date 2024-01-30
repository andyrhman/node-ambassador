import { Response, Request } from "express";
import { plainToClass } from "class-transformer";
import { RegisterDto } from "../validation/dto/register.dto";
import { validate } from "class-validator";
import { formatValidationErrors } from "../utility/validation.utility";
import { User } from "../entity/user.entity";
import logger from "../config/logger"
import myDataSource from "../config/db.config";
import * as argon2 from 'argon2'
import { sign, verify } from "jsonwebtoken";
import { Order } from "../entity/order.entity";

export const Register = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const input = plainToClass(RegisterDto, body);
        const validationErrors = await validate(input);

        if (validationErrors.length > 0) {
            // Use the utility function to format and return the validation errors
            return res.status(400).json(formatValidationErrors(validationErrors));
        }

        const user = await myDataSource.getRepository(User).save({
            fullName: body.fullname,
            username: body.username,
            email: body.email,
            password: await argon2.hash(body.password),
            // ! THIS CODE IS USELESS
            // ? JUST MAKE IT FALSE WITHOUT USING THE REQUEST ENDPOINT
            is_ambassador: req.path === '/api/ambassador/register'
        });

        delete user.password;

        res.send(user)
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const Login = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const repository = myDataSource.getRepository(User);

        let user: User;

        if (body.email) {
            user = await repository.findOne({ where: { email: body.email }, select: ['id', 'password', 'is_ambassador'] });
        } else {
            user = await repository.findOne({ where: { username: body.username }, select: ['id', 'password', 'is_ambassador'] });
        }

        if (!user) {
            return res.status(400).send({ message: "Invalid Credentials" });
        }

        if (!await argon2.verify(user.password, body.password)) {
            return res.status(400).send({ message: "Invalid Credentials" });
        }

        const adminLogin = req.path === '/api/admin/login';

        if (user.is_ambassador && adminLogin) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        const token = sign({
            id: user.id,
            scope: adminLogin ? 'admin' : 'ambassador'
        }, process.env.JWT_SECRET_ACCESS);

        res.cookie('user_session', token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        })

        res.status(200).send({ message: "Successfully logged in!" });
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const AuthenticatedUser = async (req: Request, res: Response) => {
    try {
        const user = req["user"]

        if (req.path === '/api/admin/user') {
            return res.send(user);
        }

        /*
            * This code has different implementation as in nestjs ambassador
            * in nestjs we count directly the ambassador revenue in the entity like this
            ?   get revenue(): number {
            ?        return this.orders.filter(o => o.complete).reduce((s, o) => s + o.ambassador_revenue, 0)
            ?   }

            * but for this project we count the revenue inside the controller
            * use this alternative if you don't want to use the nestjs one
        */
        const orders = await myDataSource.getRepository(Order).find({
            where: {
                user_id: user.id,
                complete: true
            },
            relations: ['order_items']
        });

        user.revenue = orders.reduce((s, o) => s + o.ambassador_revenue, 0);

        res.send(user);
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const Logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie('user_session');

        res.status(204).send(null)
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const UpdateInfo = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const user = req["user"];

        const repository = myDataSource.getRepository(User);

        const existingUser = await repository.findOne({ where: { id: user.id } });

        if (!existingUser) {
            return res.status(400).send({ message: 'Invalid Request' });
        }

        if (body.fullname) {
            existingUser.fullName = body.fullname;
        }

        if (body.email && body.email !== existingUser.email) {
            const existingUserByEmail = await repository.findOne({ where: { email: body.email } });
            if (existingUserByEmail) {
                return res.status(400).send({ message: 'Email already exists' });
            }
            existingUser.email = body.email;
        }

        if (body.username && body.username !== existingUser.username) {
            const existingUserByUsername = await repository.findOne({ where: { username: body.username } });
            if (existingUserByUsername) {
                return res.status(400).send({ message: 'Username already exists' });
            }
            existingUser.username = body.username;
        }

        await repository.update(user.id, req.body);

        res.status(202).send(existingUser)
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const UpdatePassword = async (req: Request, res: Response) => {
    try {
        const user = req["user"];

        if (await req.body.password !== req.body.confirm_password) {
            return res.status(400).send({ message: "Password not match" })
        }

        await myDataSource.getRepository(User).update(user.id, {
            password: await argon2.hash(req.body.password)
        });

        res.status(202).send(user)
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" })
    }
}