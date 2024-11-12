import {Request, Response, Router} from 'express';
import "reflect-metadata";
import Logger from "../lib/logger";
import validateColor from "../validators/color_validator";
import Broker from '../lib/Broker';
import InvalidColorError from '../exceptions/InvalidColourError';
import { LightController } from '../lib/LightController';
import LightNotFoundError from '../exceptions/LightNotFoundError';

function createDisplayRoutes(controller:LightController) {
    const displayRouter = Router();
    displayRouter.post('/color', async (req: Request, res: Response) => {
        try {
            const color = validateColor(req.body.color);
            controller.setAllLightColors(color);
            res.json({});
        } catch (e) {
            if(e instanceof InvalidColorError) {
                res.status(340).json("Invalid colour");
            }
        }
    });
    displayRouter.post("/all", async (req: Request, res: Response)=> {
        try {
            const updates = req.body.lights;
            updates.map(async (update:any, i:number)=> {
                let color = validateColor(update.color);
                controller.setLightColor(update.id, color)
            });
            res.json({});

        } catch(error){
            if(error instanceof InvalidColorError) {
                Logger.error(error);
                res.status(400).json("invalid color");
            }
            if (error instanceof LightNotFoundError) {
                res.status(404).json("Light not found");
            }
        };
    });
    return displayRouter;
}

export default createDisplayRoutes;

