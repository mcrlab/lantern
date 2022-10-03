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
    .post("/config", async (req: Request, res: Response) => {
        const config = req.body;
        broker.publish('config', JSON.stringify(config));
        res.json({});
    })
    .post("/restart", async (req: Request, res: Response) => {
        broker.publish(`restart`, "{}");
        res.json({});
    })
    .post("/update", async (req: Request, res: Response) => {
        broker.publish(`update`, "{}")
        res.json({});
    })
    .get("/:lightID", async (req: Request, res: Response) => {
        const light = await getRepository(Light).findOne(req.params.lightID);
        if(light) {
            res.json(light);
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
            const lightId = parseInt(req.params.lightID, 10);
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

