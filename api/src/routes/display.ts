import {Request, Response, Router} from 'express';
import "reflect-metadata";
import { AppDataSource } from "../data-source";
import { Light } from "../entity/Light";
import Logger from "../lib/logger";
import validateColor from "../validators/color_validator";
import Broker from '../lib/Broker';

function createDisplayRoutes(broker:Broker) {
    const displayRouter = Router();
    displayRouter.post('/color', async (req: Request, res: Response) => {
        const color = validateColor(req.body.color);

        const lights = await AppDataSource.getRepository(Light).find({cache: true});

        lights.map(async (light: Light)=> {
            broker.publish(`color/${light.address}`, color)
        });

        res.json(lights);
    });
    displayRouter.post("/all", async (req: Request, res: Response)=> {
        try {
            const updates = req.body.lights;
            updates.map((update:any, index:number)=>{
                validateColor(update.color);
            });
            const lights = await AppDataSource.getRepository(Light).find({cache: true});
            updates.map(async (update:any, i:number)=> {
                const light = lights.find((element)=> { return element.id === update.id});
                if(light){
                    broker.publish(`color/${light.address}`, update.color);
                }
            });
            res.json({});

        } catch(error){
            Logger.error(error);
            res.status(400).json(error || "Oops something went wrong");
        };
    });
    return displayRouter;
}

export default createDisplayRoutes;

