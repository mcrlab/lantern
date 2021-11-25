import * as express from "express";
import {Request, Response} from 'express';
import "reflect-metadata";
import {getRepository} from "typeorm";
import { Light } from "../entity/Light";
import { LightInstruction } from "../entity/LightInstruction";
import {Frame} from "../entity/Frame";
import Logger from "../lib/logger";
import MQTTBroker from "../lib/mqtt";
function createFrameRoutes(broker:MQTTBroker) {
    const frameRouter = express.Router()
    .get('/', async (req: Request, res: Response) => {
        const data = await getRepository(Frame).find();
        res.json(data);
    })
    .post('/', async (req, res) => {
        try {
            const colors = req.body.colors;

            const lights = await getRepository(Light).find({
                order: {
                    x: "ASC"
                }
            });
            let wait = 0;
            const time   = req.body.time   || 10;
            const delay  = req.body.delay  || 10;
            const easing = req.body.easing || "LinearInterpolation";

            let instructions:LightInstruction[] = [];

            colors.map(async (color:string, i:number)=> {
                
                if(lights[i]){
                    Logger.info(color);
                    const instruction = new LightInstruction();
                    instruction.light = lights[i];
                    instruction.color = color;
                    instruction.easing = easing;
                    instruction.time = time;
                    instruction.delay = delay;
                    instructions.push(instruction);

                    if(wait < (instruction.time + instruction.delay)){
                        wait = instruction.time + instruction.delay;
                    }
                    if(process.env.QUEUE_ENABLED){
                        await getRepository(LightInstruction).save(instruction);

                    } else {
                        if(lights[i].color !== instruction.color){
                            delete instruction.light;
                            broker.publish(`color/${lights[i].address}`, JSON.stringify(instruction));
                        }
                    }
                } else {
                    return;
                }
            });
            if(process.env.QUEUE_ENABLED){
                const frame        = new Frame();
                frame.complete     = false;
                frame.created      = new Date();
                frame.wait         = wait;
                frame.instructions = instructions;
                await getRepository(Frame).save(frame);
            }
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
            let instructions:LightInstruction[] = [];
            let wait = 0;


            updates.map(async (update:any, i:number)=> {
                const light = lights.find((element)=> { return element.id === update.id});
                if(light){
                    const instruction = new LightInstruction();
                    instruction.light = light;
                    instruction.color = update.color;
                    instruction.easing = update.easing || "LinearInterpolation";
                    instruction.time = update.time || 0;
                    instruction.delay = update.delay || 0;
                    instructions.push(instruction);
                    if(wait < (instruction.time + instruction.delay)){
                        wait = instruction.time + instruction.delay;
                    }
                    if(process.env.QUEUE_ENABLED){
                        await getRepository(LightInstruction).save(instruction);
                    } else {
                        delete instruction.light;
                        broker.publish(`color/${lights[i].address}`, JSON.stringify(instruction));
                    }
                }
            });

            if(process.env.QUEUE_ENABLED){
                const frame        = new Frame();
                frame.complete     = false;
                frame.wait         = 0;
                frame.created      = new Date();
                frame.wait = wait;
                frame.instructions = instructions;
                await getRepository(Frame).save(frame);
            }


            return res.json({});

        } catch(error){
            Logger.error(error);
            res.status(400).json(error || "Oops something went wrong");
        };
    });
    return frameRouter;
}

export default createFrameRoutes;

