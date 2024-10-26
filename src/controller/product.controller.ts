import myDataSource from "../config/db.config";
import logger from "../config/logger";
import sanitizeHtml from 'sanitize-html';
import { Request, Response } from "express";
import { Product } from "../entity/product.entity";
import { client } from "../index";

export const Products = async (req: Request, res: Response) => {
    try {
        const products = await myDataSource.getRepository(Product).find();
        res.send({ products });
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" });
    }

};

export const CreateProduct = async (req: Request, res: Response) => {
    try {
        res.send(await myDataSource.getRepository(Product).save(req.body));
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" });
    }
};

export const GetProduct = async (req: Request, res: Response) => {
    try {
        res.send(await myDataSource.getRepository(Product).findOne({ where: { id: req.params.id } }));
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" });
    }
};

export const UpdateProduct = async (req: Request, res: Response) => {
    try {
        const repository = myDataSource.getRepository(Product);

        await repository.update(req.params.id, req.body);

        res.status(202).send(await repository.findOne({ where: { id: req.params.id } }));
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" });
    }
};

export const DeleteProduct = async (req: Request, res: Response) => {
    try {
        await myDataSource.getRepository(Product).delete(req.params.id);

        res.status(204).send(null);
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" });
    }
};

export const ProductsFrontend = async (req: Request, res: Response) => {
    try {
        // ? Show the products from redis cache
        let products = JSON.parse(await client.get('products_frontend'));

        // ? If the cache has expired
        if (!products) {
            // ? Get the products from db
            products = await myDataSource.getRepository(Product).find();

            // ? Set the cache name and expire time
            await client.set('products_frontend', JSON.stringify(products), {
                EX: 1800 // ? 30 minutes
            });
        }

        res.send(products);
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" });
    }
};

export const ProductsBackend = async (req: Request, res: Response) => {
    try {
        // ? Show the products from redis cache
        let products = JSON.parse(await client.get('products_frontend'));

        // ? If the cache has expired
        if (!products) {
            // ? Get the products from db
            products = await myDataSource.getRepository(Product).find();

            // ? Set the cache name and expire time
            await client.set('products_frontend', JSON.stringify(products), {
                EX: 1800 // ? 30 minutes
            });
        }

        // * Search product
        let search: any = req.query.search;

        // https://www.phind.com/search?cache=za3cyqzb06bugle970v91phl
        search = sanitizeHtml(search);
        if (search) {
            products = products.filter(
                p => p.title.toLowerCase().indexOf(search) >= 0 ||
                    p.description.toLowerCase().indexOf(search) >= 0
            );

            // Check if the resulting filtered data array is empty
            if (products.length === 0) {
                // Respond with a 404 status code and a message
                return res.status(404).json({ message: `No ${search} matching your search criteria.` });
            }
        }

        // * Sorting the products
        let sort: any = req.query.sort;
        sort = sanitizeHtml(sort);

        if (sort === 'asc' || sort === 'desc') {
            products.sort((a, b) => {
                const diff = a.price - b.price;

                if (diff === 0) return 0;

                const sign = Math.abs(diff) / diff;

                return sort === 'asc' ? -sign : sign;
            });
        }

        // * Paginating products
        const page: number = parseInt(req.query.page as any) || 1;
        const perPage = 9;
        const total = products.length;

        const data = products.slice((page - 1) * perPage, page * perPage);

        res.send({
            data,
            total,
            page,
            last_page: Math.ceil(total / perPage)
        });
    } catch (error) {
        logger.error(error);
        return res.status(400).send({ message: "Invalid Request" });
    }
};