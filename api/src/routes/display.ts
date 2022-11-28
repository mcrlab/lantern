import * as express from "express";
import {Request, Response} from 'express';
import "reflect-metadata";
import {getRepository} from "typeorm";
import { Light } from "../entity/Light";
import Logger from "../lib/logger";
import MQTTBroker from "../lib/mqtt";
import validateColor from "../validators/color_validator";

function createDisplayRoutes(broker:MQTTBroker) {
    const frameRouter = express.Router()
    .post('/', async (req, res) => {
        try {
            const colors = req.body.colors;

            const lights = await getRepository(Light).find({
                order: {
                    x: "ASC",
                    id: "ASC"
                }
            });
            colors.map((color:string, index:number) => {
                validateColor(color);
            });
            colors.map(async (color:string, i:number)=> {
                
                if(lights[i]){
                    Logger.info(color);
                    broker.publish(`color/${lights[i].address}`, color);
                
                }
            });
            return res.json({});

        } catch(error){
            Logger.error(error);
            res.status(400).json(error || "Oops something went wrong");
        };
    })
    .post('/color', async (req, res) => {
        try {
            const color = validateColor(req.body.color);

            const lights = await getRepository(Light).find();

            lights.map(async (light: Light)=> {
                broker.publish(`color/${light.address}`, color)
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
            updates.map((update:any, index:number)=>{
                validateColor(update.color);
            });
            const lights = await getRepository(Light).find();
            updates.map(async (update:any, i:number)=> {
                const light = lights.find((element)=> { return element.id === update.id});
                if(light){
                    broker.publish(`color/${light.address}`, update.color);
                }
            });
            return res.json({});

        } catch(error){
            Logger.error(error);
            res.status(400).json(error || "Oops something went wrong");
        };
    });
    return frameRouter;
}

export default createDisplayRoutes;

