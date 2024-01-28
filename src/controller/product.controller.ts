import myDataSource from "../config/db.config";
import { Request, Response } from "express";
import { Product } from "../entity/product.entity";
import logger from "../config/logger";

export const Products = async (req: Request, res: Response) => {
    try {
        res.send(await myDataSource.getRepository(Product).find())
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send({ message: "Invalid Request" })
    }

}

export const CreateProduct = async (req: Request, res: Response) => {
    try {
        res.send(await myDataSource.getRepository(Product).save(req.body))
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const GetProduct = async (req: Request, res: Response) => {
    try {
        res.send(await myDataSource.getRepository(Product).findOne({ where: { id: req.params.id } }))
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const UpdateProduct = async (req: Request, res: Response) => {
    try {
        const repository = myDataSource.getRepository(Product);

        await repository.update(req.params.id, req.body);

        res.status(202).send(await repository.findOne({ where: { id: req.params.id } }))
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send({ message: "Invalid Request" })
    }
}

export const DeleteProduct = async (req: Request, res: Response) => {
    try {
        await myDataSource.getRepository(Product).delete(req.params.id);

        res.status(204).send(null);
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send({ message: "Invalid Request" })
    }
}