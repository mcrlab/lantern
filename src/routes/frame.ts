import * as express from "express";
import {Request, Response} from 'express';
import "reflect-metadata";
import {getRepository} from "typeorm";
import { Light } from "../entity/Light";
import { LightInstruction } from "../entity/LightInstruction";
import {Frame} from "../entity/Frame";
import Logger from "../lib/logger";
import broker from "../lib/mqtt";
const frameRouter = express.Router()
.get('/', async (req: Request, res: Response) => {
    const data = await getRepository(Frame).find();
    res.json(data);
})
.post('/', async (req, res) => {
    try {
        const colors = req.body.colors;

        const lights = await getRepository(Light).find();

        const time   = 10;
        const delay  = 10;
        const easing = req.body.easing || "LinearInterpolation";
        const frame        = new Frame();
        frame.complete     = false;
        frame.created      = new Date();
        frame.wait         = 0;

        if(process.env.QUEUE_ENABLED){
            await getRepository(Frame).save(frame);
        }

        colors.map(async (color:string, i:number)=> {
            if(lights[i]){
                const instruction = new LightInstruction();
                instruction.light = lights[i];
                instruction.color = color;
                instruction.easing = easing;
                instruction.time = time;
                instruction.delay = delay;

                if(process.env.QUEUE_ENABLED){
                    instruction.frame = frame;
                    await getRepository(LightInstruction).save(instruction);
                    frame.wait = (time + delay)
                    await getRepository(Frame).save(frame);
                } else {
                    delete instruction.light;
                    broker.publish(`color/${lights[i].address}`, JSON.stringify(instruction));
                }
            } else {
                return;
            }
        });

        return res.json({});

    } catch(error){
        Logger.error(error);
        res.status(400).json(error || "Oops something went wrong");
    };
})
.post("/all", async (req: Request, res: Response)=> {
    try {
        const updates = req.body.lights;

        const lights = await getRepository(Light).find();

        const frame        = new Frame();
        frame.complete     = false;
        frame.wait         = 0;
        frame.created      = new Date();

        if(process.env.QUEUE_ENABLED){
            await getRepository(Frame).save(frame);
        }
        updates.map(async (update:any, i:number)=> {
            const light = lights.find((element)=> { return element.id === update.id});
            if(light){
                const instruction = new LightInstruction();
                instruction.light = light;
                instruction.color = update.color;
                instruction.easing = update.easing || "LinearInterpolation";
                instruction.time = update.time || 0;
                instruction.delay = update.delay || 0;

                if(process.env.QUEUE_ENABLED){
                    instruction.frame = frame;
                    await getRepository(LightInstruction).save(instruction);
                    frame.wait = (instruction.time + instruction.delay)
                    await getRepository(Frame).save(frame);
                } else {
                    delete instruction.light;
                    broker.publish(`color/${lights[i].address}`, JSON.stringify(instruction));
                }
            }

        });


        return res.json({});

    } catch(error){
        Logger.error(error);
        res.status(400).json(error || "Oops something went wrong");
    };
});


export default frameRouter;

