// import { Request, Response } from "express";
// import myDataSource from "../config/db.config";
// import { User } from "../models/user.schema";
// import logger from "../config/logger";

// export const Ambassadors = async (req: Request, res: Response) => {
//     try {
//         res.send(await myDataSource.getRepository(User).find({
//             where: {
//                 is_ambassador: true
//             }
//         }))
//     } catch (error) {
//         logger.error(error);
//         return res.status(400).send({ message: "Invalid Request" })
//     }
// }