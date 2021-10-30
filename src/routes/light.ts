import * as express from "express";
import {Request, Response} from 'express';
import "reflect-metadata";
import {getRepository} from "typeorm";
import {Light} from "../entity/Light";
import Logger from "../lib/logger";

const lightRouter = express.Router()
.get('/', async (req: Request, res: Response) => {
    const lights = await getRepository(Light).find();
    res.json(lights);
})
.get("/:lightID", async (req: Request, res: Response) => {
    const light = await getRepository(Light).findOne(req.params.lightID);
    res.json(light);
});

export default lightRouter;

