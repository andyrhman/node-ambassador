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
            is_ambassador: false
        });

        delete user.password;

        res.send(user)
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const Login = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const repository = myDataSource.getRepository(User);

        let user: User;

        if (body.email) {
            user = await repository.findOne({ where: { email: body.email }, select: ['id', 'password'] });
        } else {
            user = await repository.findOne({ where: { username: body.username }, select: ['id', 'password'] });
        }

        if (!user) {
            return res.status(400).send({ message: "Invalid Credentials" });
        }

        if (!await argon2.hash(user.password, body.password)) {
            return res.status(400).send({ message: "Invalid Credentials" });
        }

        const token = sign({
            id: user.id
        }, process.env.JWT_SECRET_ACCESS);

        res.cookie('user_session', token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        })

        res.status(200).send({ message: "Successfully logged in!" });
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const AuthenticatedUser = async (req: Request, res: Response) => {
    try {
        const jwt = req.cookies["user_session"];

        const payload: any = verify(jwt, process.env.JWT_SECRET_ACCESS);

        const user = await myDataSource.getRepository(User).findOne({ where: { id: payload.id } });

        res.send(user)
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const Logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie('user_session');

        res.status(204).send(null)
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send({ message: "Invalid Request" })
    }
}