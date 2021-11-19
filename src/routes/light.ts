import * as express from "express";
import {Request, Response} from 'express';
import "reflect-metadata";
import { getRepository } from "typeorm";
import { Light } from "../entity/Light";
import { LightInstruction } from "../entity/LightInstruction";
import { Frame } from "../entity/Frame";
import MQTTBroker from "../lib/mqtt";


import Logger from "../lib/logger";
import { LightController } from "../lib/LightController";

function createLightRoutes(broker: MQTTBroker, controller: LightController){
    const lightRouter = express.Router()
    .get('/', async (req: Request, res: Response) => {
        const lights = await getRepository(Light).find();
        res.json(lights);
    })
    .post('/', async (req: Request, res: Response) => {
        try {
            const color        = req.body.color;
            const time:number  = parseInt(req.body.time, 10) || 0;
            const delay:number = parseInt(req.body.delay, 10) || 0;
            const easing       = req.body.easing || "LinearInterpolation";
            const lights       = await getRepository(Light).find();
            let instructions:LightInstruction[] = [];
    
            for(const light of lights){
                const instruction = new LightInstruction();
                instruction.light = light;
                instruction.color = color;
                instruction.time = time;
                instruction.delay = delay;
                instruction.easing = easing;
    
                if(process.env.QUEUE_ENABLED){
                    await getRepository(LightInstruction).save(instruction);
                    instructions.push(instruction);
                } else {
                    delete instruction.light;
                    broker.publish(`color/${light.address}`, JSON.stringify(instruction));
                }
            }
            if(process.env.QUEUE_ENABLED){
                const frame = new Frame();
                frame.complete     = false;
                frame.wait         = time + delay;
                frame.created      = new Date();
                frame.instructions = instructions;
                await getRepository(Frame).save(frame);
            }
    
            return res.json({});
    
          } catch(error){
              Logger.error(error);
              res.status(400).json(error);
          };
    })
    .get("/:lightID", async (req: Request, res: Response) => {
        const light = await getRepository(Light).findOne(req.params.lightID);
        if(light) {
            res.json(light);
        } else {
            res.status(404).json("Light not found");
        }
    })
    .post("/:lightID", async (req: Request, res: Response) => {
    
        const color  = req.body.color;
        const easing = req.body.easing || "LinearInterpolation";
        const time   = parseInt(req.body.time, 10) || 0;
        const delay  = parseInt(req.body.delay, 10) || 0;
    
        const light = await getRepository(Light).findOne(req.params.lightID);
        if(light){
            const instruction = new LightInstruction();
    
            instruction.light  = light;
            instruction.color  = color;
            instruction.easing = easing;
            instruction.delay  = delay;
            instruction.time   = time;
    
            if(process.env.QUEUE_ENABLED){
                await getRepository(LightInstruction).save(instruction);
                const frame = new Frame();
                frame.complete     = false;
                frame.wait         = time + delay;
                frame.created      = new Date();
                frame.instructions = [instruction];
                await getRepository(Frame).save(frame);
            } else {
                delete instruction.light;
                broker.publish(`color/${light.address}`, JSON.stringify(instruction));
            }
            res.json({});
        } else {
            res.status(404).json("Light not found");
        }
    })
    .post("/:lightID/position", async(req: Request, res: Response) => {
        const lightId = parseInt(req.params.lightID, 10);
        const x = parseInt(req.body.x, 10);
        const y = parseInt(req.body.y, 10);
        try {
            await controller.updateLightPosition(lightId, x, y);
            res.send({});
        } catch (error){
            res.status(error.status|| 400).json(error);
        }
    })
    .post("/:lightID/update", async (req: Request, res: Response) => {
        try {
            const lightId = parseInt(req.params.lightID, 10);
            await controller.updateLightFirmware(lightId);
            res.send({});
        } catch (error){
            res.status(error.status|| 400).json(error);
        }
    })
    .post("/:lightID/sleep", async (req: Request, res: Response) => {
        try {
            const lightId = parseInt(req.params.lightID, 10);
            const seconds = parseInt(req.body.seconds, 10);
            await controller.sleepLight(lightId, seconds);
            res.send({});
        } catch (error){
            res.status(error.status || 400).json(error);
        }
    })
    .post("/:lightID/restart", async (req: Request, res: Response) => {
        try {
            const lightId = parseInt(req.params.lightID, 10);
            await controller.restartLight(lightId);
            res.send({});
        } catch (error){
            res.status(error.status || 400).json(error);
        }
    })
    .post("/:lightID/config", async (req: Request, res: Response) => {
        try {
            const lightId = parseInt(req.params.lightId);
            const config = req.body;
            await controller.updateLightConfig(lightId, config);
            res.send({})
        } catch (error) {
            res.status(error.status || 400).json(error);
        }
    })
    .post("/:lightID/delete", async (req: Request, res: Response) => {
        try {
            const lightId = parseInt(req.params.lightID, 10);
            await controller.removeLight(lightId);
            res.send({});
        } catch (error){
            res.status(error.status || 400).json(error);
        }
    });
    return lightRouter;
}

export default createLightRoutes;

