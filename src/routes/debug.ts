import * as express from "express";
import {Request, Response} from 'express';
import "reflect-metadata";
import {getRepository, createQueryBuilder} from "typeorm";
import Logger from "../lib/logger";
import { Frame } from "../entity/Frame";
import { LightInstruction } from "../entity/LightInstruction";
import broker from "../lib/mqtt";
const debugRouter = express.Router()
.get('/', async (req: Request, res: Response) => {


    const nextFrame = await getRepository(Frame)
                            .createQueryBuilder("frame")
                            .where("frame.complete = :isComplete", { isComplete: false })
                            .orderBy('frame.created', 'DESC')
                            .getOne();

    if(nextFrame){
        const instructions = await getRepository(LightInstruction)
                                    .createQueryBuilder("instruction")
                                    .select(["instruction.color", "instruction.time", "instruction.easing", "instruction.delay", "light.address"])
                                    .leftJoin('instruction.light', "light")
                                    .where("instruction.frameId = :id", { id: nextFrame.id})
                                    .getRawMany();

        for(const instruction of instructions){
            const data = {
                color: instruction.instruction_color,
                time:instruction.instruction_time,
                delay: instruction.instruction_delay,
                easing: instruction.instruction_easing
            }
            //broker.publish(`color/${instruction.light_address}`,JSON.stringify(data));
        }
       nextFrame.complete = true;
       getRepository(Frame).save(nextFrame);
       res.json({});
    } else {
        res.json([]);
    }
});

export default debugRouter;

