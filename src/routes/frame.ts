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


            let instructions:LightInstruction[] = [];

            colors.map(async (color:string, i:number)=> {
                
                if(lights[i]){
                    Logger.info(color);
                    const instruction = new LightInstruction();
                    instruction.light = lights[i];
                    instruction.color = color;
                    
                    instruction.start_time = Math.ceil(process.uptime() * 1000) + parseInt(process.env.ANIMATION_OFFSET);
                    
                    
                    instructions.push(instruction);


                    if(process.env.QUEUE_ENABLED){
                        await getRepository(LightInstruction).save(instruction);
                    }

                } else {
                    return;
                }
            });
            const frame        = new Frame();
            frame.complete     = false;
            frame.created      = new Date();
            frame.wait         = wait;
            frame.instructions = instructions;
            frame.start_time = Math.ceil(process.uptime() * 1000) + parseInt(process.env.ANIMATION_OFFSET);
            if(process.env.QUEUE_ENABLED){
                await getRepository(Frame).save(frame);
            } else {

                let instructionSet = []
                for (const instruction of instructions){
                    instructionSet.push({
                        "address": instruction.light.address,
                        "color": instruction.color,
                        "start_time": instruction.start_time
                    });
                }

                broker.publish('frame', JSON.stringify(instructionSet))
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
                    instructions.push(instruction);

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

