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
    color.name = req.body.name;
    color.hexcode = req.body.hexcode;
    const data = await getRepository(Color).save(color);
    res.json({});
    Logger.debug("New colour added");
});

export default colorRouter;

