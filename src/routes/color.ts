import * as express from "express";
import {Request, Response} from 'express';
import "reflect-metadata";
import {getRepository} from "typeorm";
import {Color} from "../entity/Color";
import Logger from "../lib/logger";

const colorRouter = express.Router()
.get('/', async (req: Request, res: Response) => {
    const colors = await getRepository(Color).find();
    res.json(colors);
})
.post('/', async (req: Request, res: Response) => {
    const color = new Color();
    color.name = "Blue";
    color.hexcode = "0000FF";
    const data = await getRepository(Color).save(color);
    res.json("Hello world");
    Logger.debug(data);
});

export default colorRouter;

