require('dotenv').config();

import logger from './config/logger';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import cookieParser from 'cookie-parser';
import MongoConfig from './config/db.config';
import { ValidationMiddleware } from './middleware/validation.middleware';
import { createClient } from 'redis';

MongoConfig();

const app = express();

export const client = createClient({
    url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@redis-14459.c252.ap-southeast-1-1.ec2.cloud.redislabs.com:14459`
});
client.connect();

app.use(express.json());
app.use(cookieParser());
app.use(ValidationMiddleware);
app.use(cors({
    credentials: true,
    origin: [`${process.env.CORS_ORIGIN}`]
}));

routes(app);

app.listen(8000, () => {
    logger.info('👍 Server listening on port 8000');
});