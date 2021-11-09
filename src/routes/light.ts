import * as express from "express";
import {Request, Response} from 'express';
import "reflect-metadata";
import { getRepository } from "typeorm";
import { Light } from "../entity/Light";
import { LightInstruction } from "../entity/LightInstruction";
import { Frame } from "../entity/Frame";
import broker from "../lib/mqtt";

import Logger from "../lib/logger";

const lightRouter = express.Router()
.get('/', async (req: Request, res: Response) => {
    const lights = await getRepository(Light).find();
    res.json(lights);
})
.post('/', async (req: Request, res: Response) => {
    try {
        const color        = req.body.color;
        const time:number  = parseInt(req.body.time, 10);
        const delay:number = parseInt(req.body.delay, 10);
        const easing       = req.body.easing || "LinearInterpolation";
        const lights       = await getRepository(Light).find();

        for(const light of lights){
            const instruction = new LightInstruction();
            instruction.light = light;
            instruction.color = color;
            instruction.time = time;
            instruction.delay = delay;
            instruction.easing = easing;

            if(process.env.QUEUE_ENABLED){
                const frame = new Frame();
                frame.complete     = false;
                frame.wait         = 0;
                frame.created      = new Date();
                await getRepository(Frame).save(frame);

                instruction.frame = frame;
                await getRepository(LightInstruction).save(instruction);

            } else {
                // delete instruction.light;
                broker.publish(`color/${light.address}`, JSON.stringify(instruction));
            }
        }
        return res.json({});

      } catch(error){
          Logger.error(error);
          res.status(400).json(error);
      };
})
.get("/:lightID", async (req: Request, res: Response) => {
    const light = await getRepository(Light).findOne(req.params.lightID);
    res.json(light);
})
.post("/:lightID", async (req: Request, res: Response) => {

    const color  = req.body.color;
    const easing = req.body.easing || "LinearInterpolation";
    const time   = req.body.time;
    const delay  = req.body.delay;

    const light = await getRepository(Light).findOne(req.params.lightID);
    if(light){
        const instruction = new LightInstruction();

        instruction.light  = light;
        instruction.color  = color;
        instruction.easing = easing;
        instruction.delay  = delay;
        instruction.time   = time;

        if(process.env.QUEUE_ENABLED){
            const frame = new Frame();
            frame.complete     = false;
            frame.wait         = 0;
            frame.created      = new Date();
            await getRepository(Frame).save(frame);
            instruction.frame = frame;
            await getRepository(LightInstruction).save(instruction);
        } else {
            delete instruction.light;
            broker.publish(`color/${light.address}`, JSON.stringify(instruction));
        }
    }
    res.json({});

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
        res.json({});
    } else {
        res.status(404).send("Light not found!")
    }
})
.post("/:lightID/update", async (req: Request, res: Response) => {
    Logger.debug("Update light firmware");
    const light = await getRepository(Light).findOne(req.params.lightID);
    if(light){
        broker.publish(`update/${light.address}`, "{}");
        res.send({});
    } else {
        res.status(404).send("Light not found!")
    }
})
.post("/:lightID/sleep", async (req: Request, res: Response) => {
    Logger.debug("Update light sleep length");
    const light = await getRepository(Light).findOne(req.params.lightID);
    const seconds = parseInt(req.body.seconds, 10);
    if(light){
        light.sleep = seconds;
        await getRepository(Light).save(light);
        const data = {
            "seconds": seconds
        }
        broker.publish(`sleep/${light.address}`,JSON.stringify(data));
        res.send({});
    } else {
        res.status(404).send("Light not found!")
    }
})
.post("/:lightID/restart", async (req: Request, res: Response) => {
    Logger.debug("Restart light");
    const light = await getRepository(Light).findOne(req.params.lightID);
    if(light){
        broker.publish(`restart/${light.address}`, "{}");
        res.send({});
    } else {
        res.status(404).send("Light not found!")
    }
})
.post("/:lightID/config", async (req: Request, res: Response) => {
    Logger.debug("Update light config");
    const light = await getRepository(Light).findOne(req.params.lightID);
    const config = req.body;
    if(light){
        broker.publish(`config/${light.address}`, JSON.stringify(config));
        res.send({});
    } else {
        res.status(404).send("Light not found!")
    }
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

