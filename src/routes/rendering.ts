import * as express from "express";
import {Request, Response} from 'express';
import "reflect-metadata";
import {getRepository} from "typeorm";
import { Light } from "../entity/Light";
import { LightInstruction } from "../entity/LightInstruction";
import {Rendering} from "../entity/Rendering";
import Logger from "../lib/logger";
import broker from "../lib/mqtt";
const renderingRouter = express.Router()
.get('/', async (req: Request, res: Response) => {
    const data = await getRepository(Rendering).find();
    res.json(data);
})
.post('/', async (req, res) => {
    try {
        const colors = req.body.colors;

        const lights = await getRepository(Light).find();

        const time   = 10;
        const delay  = 10;
        const easing = req.body.easing || "LinearInterpolation";
        const instructions = [];
        colors.map(async (color:string, i:number)=> {
            if(lights[i]){
                const instruction = new LightInstruction();
                instruction.light = lights[i];
                instruction.color = color;
                instruction.easing = easing;
                instruction.time = time;
                instruction.delay = delay;

                if(process.env.QUEUE_ENABLED){
                    await getRepository(LightInstruction).save(instruction);
                    instructions.push(instruction);
                } else {
                    delete instruction.light;
                    broker.publish(`color/${lights[i].address}`, JSON.stringify(instruction));
                }
            } else {
                return;
            }
        });

        if(process.env.QUEUE_ENABLED){
            const rendering          = new Rendering();
            rendering.complete     = false;
            rendering.lastUpdated  = new Date();
            rendering.instructions = instructions;
            await getRepository(Rendering).save(rendering);
        }


        return res.json({});

    } catch(error){
        Logger.error(error);
        res.status(error.status|| 400).json(error || "Oops something went wrong");
    };
})
.post("/all", async (req: Request, res: Response)=> {
    try {
        const updates = req.body.lights;

        const lights = await getRepository(Light).find();

        const instructions = [];

        updates.map(async (update:any, i:number)=> {
            const light = lights.find((element)=> { return element.id === update.id});
            const instruction = new LightInstruction();
            instruction.light = light;
            instruction.color = update.color;
            instruction.easing = update.easing || "LinearInterpolation";
            instruction.time = update.time || 0;
            instruction.delay = update.delay || 0;

            if(process.env.QUEUE_ENABLED){
                await getRepository(LightInstruction).save(instruction);
                instructions.push(instruction);
            } else {
                delete instruction.light;
                broker.publish(`color/${lights[i].address}`, JSON.stringify(instruction));
            }

        });

        if(process.env.QUEUE_ENABLED){
            const rendering          = new Rendering();
            rendering.complete     = false;
            rendering.lastUpdated  = new Date();
            rendering.instructions = instructions;
            await getRepository(Rendering).save(rendering);
        }

        return res.json({});

    } catch(error){
        Logger.error(error);
        res.status(error.status|| 400).json(error || "Oops something went wrong");
    };
});


export default renderingRouter;

