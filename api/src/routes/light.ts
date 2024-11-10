import {Request, Response, Router} from 'express';
import "reflect-metadata";
import { AppDataSource } from "../data-source";
import { Light } from "../entity/Light";
import { LightController } from "../lib/LightController";


function createLightRoutes(controller: LightController){
    const lightRouter = Router()
    .get('/', async (req: Request, res: Response) => {
        const lights = await AppDataSource.getRepository(Light).find( {
            order: {
              x: "ASC",
              id: "ASC"
            }
    });
        res.json(lights);
    })
    .get("/:lightID", async (req: Request, res: Response) => {
        const light = await AppDataSource.getRepository(Light).findOne({ where: { "id" : Number(req.params.lightID)}
         });
        if(light) {
            res.json(light);
        } else {
            res.status(404).json("Light not found");
        }
    })
    .post("/:lightID", async (req: Request, res: Response) => {
        const light = await AppDataSource.getRepository(Light).findOne({ where: { "id" : Number(req.params.lightID)}
        });
        if(light) {
            res.json(light);
        } else {
            res.status(404).json("Light not found");
        }   
    })
    .post("/:lightID/position", async(req: Request, res: Response) => {
        const lightId = parseInt(req.params.lightID, 10);
        const x = parseInt(req.body.x, 10);
        try {
            await controller.updateLightPosition(lightId, x);
            res.send({});
        } catch (error){
            res.status(error.status|| 400).json(error);
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

