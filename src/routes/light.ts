import * as express from "express";
import {Request, Response} from 'express';
import "reflect-metadata";
import {getRepository} from "typeorm";
import {Light} from "../entity/Light";
import { LightInstruction } from "../entity/LightInstruction";

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
.post("/:lightID", async (req: Request, res: Response) => {
    try {
        const color  = req.body.color;
        const easing = req.body.easing || "LinearInterpolation";
        const time   = req.body.time;
        const delay  = req.body.delay;

        const light = await getRepository(Light).findOne(req.params.lightID);

        const instruction = new LightInstruction();

        instruction.light  = light;
        instruction.color  = color;
        instruction.easing = easing;
        instruction.delay  = delay;
        instruction.time   = time;

        await getRepository(LightInstruction).save(instruction);

        res.json({});
    } catch (e){
        
    }
})
.post("/:lightID/position", async(req: Request, res: Response) => {
    Logger.debug("Update light position");
    const light = await getRepository(Light).findOne(req.params.lightID);
    if(light){
        const x = req.body.x;
        const y = req.body.y;
        light.x = x || 0;
        light.y = y || 0;
        await getRepository(Light).save(light);
        res.send("Success");
    } else {
        res.status(404).send("Light not found!")
    }
})
.post("/:lightID/update", async (req: Request, res: Response) => {
    Logger.warn("Update light firmware");
    res.send("to be implemented");

    // update firmware
})
.post("/:lightID/sleep", async (req: Request, res: Response) => {
    Logger.debug("Update light sleep length");
    const light = await getRepository(Light).findOne(req.params.lightID);
    if(light){
        light.sleep = parseInt(req.body.seconds, 10);
        await getRepository(Light).save(light);
        res.send("Success");
    } else {
        res.status(404).send("Light not found!")
    }
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
    Logger.debug("Delete light");
    const light = await getRepository(Light).findOne(req.params.lightID);
    if(light){
        await getRepository(Light).remove(light);
        res.send("Success");
    } else {
        res.status(404).send("Light not found!")
    }

});

export default lightRouter;

