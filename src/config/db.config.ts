import logger from './logger';
import mongoose from 'mongoose';

const MongoConfig = () => {
    mongoose.connect('mongodb://localhost/node_ambassador')
        .then(() => logger.info('🗃️ Database has been initialized!'))
        .catch((err) => logger.error(err));
    require('../models/user.schema');
    require('../models/product.schema');
    require('../models/link.schema');
    require('../models/order.schema');
    require('../models/order-item.schema');
}

export default MongoConfig;