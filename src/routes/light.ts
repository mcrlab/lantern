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
})
.post("/:lightID/position", async(req: Request, res: Response) => {
    Logger.warn("Update light position");
    res.send("to be implemented");
    // update position
})
.post("/:lightID/update", async (req: Request, res: Response) => {
    Logger.warn("Update light firmware");
    res.send("to be implemented");

    // update firmware
})
.post("/:lightID/sleep", async (req: Request, res: Response) => {
    Logger.warn("Update light sleep length");
    res.send("to be implemented");

    // sleep
})
.post("/:lightID/restart", async (req: Request, res: Response) => {
    Logger.warn("Restart light");

    res.send("to be implemented");
    // restart
})
.post("/:lightID/config", async (req: Request, res: Response) => {
    Logger.warn("Update light config");

    res.send("to be implemented");
    // update config
})
.post("/:lightID/delete", async (req: Request, res: Response) => {
    Logger.warn("Delete light");

    res.send("to be implemented");
    // delete
});

export default lightRouter;

