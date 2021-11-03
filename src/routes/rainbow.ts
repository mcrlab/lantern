import { getRepository } from "typeorm";
import { Light } from "../entity/Light";
import { LightInstruction } from "../entity/LightInstruction";
import { Rendering } from "../entity/Rendering";
import broker from "../lib/mqtt";

import * as express from "express";
import {Request, Response} from 'express';
import Logger from "../lib/logger";

function intToHex(color){
    let char = color.toString(16);
    if(char.length === 1){
      char = "0"+char;
    }
    return char.toUpperCase();
  }

function RGBObjectToHex(colorObject){
    const hex = [];
    hex.push(intToHex(colorObject.r));
    hex.push(intToHex(colorObject.g));
    hex.push(intToHex(colorObject.b));
    return hex.join('');
}

function Wheel(WheelPos:number){
    WheelPos = 255 - WheelPos;

    if(WheelPos < 85) {
      return {
          "r":Math.round(255 - WheelPos * 3),
          "g":0,
          "b":Math.round(WheelPos * 3)
      };
    }
    if(WheelPos < 170) {
      WheelPos -= 85;
      return {
          "r":0,
          "g":Math.round(WheelPos * 3),
          "b":Math.round(255 - WheelPos * 3)
      };
    }
    WheelPos -= 170;
    return {
        "r":Math.round(WheelPos * 3),
        "g":Math.round(255 - WheelPos * 3),
        "b":0
    };
}
const rainbowRouter = express.Router()
.post('/', async (req: Request, res: Response) => {
    try {
        const lights = await getRepository(Light).find();
        lights.sort((a,b)=>{
            return a.x - b.x
        });

        const time =   req.body.time;
        const delay =  req.body.delay;
        const easing = req.body.easing || "LinearInterpolation";

        const instructions = [];

        const numberOfLights = lights.length;

        lights.map(async(light, index)=>{

            const value = 255 * (index/numberOfLights);
            const color = RGBObjectToHex(Wheel(value));
            const instruction = new LightInstruction();
            instruction.light = light;
            instruction.color = color;
            instruction.easing = easing;
            instruction.time = time;
            instruction.delay = delay;

            if(process.env.QUEUE_ENABLED){
                await getRepository(LightInstruction).save(instruction);
                instructions.push(instruction);
            } else {
                delete instruction.light;
                broker.publish(`color/${light.address}`, JSON.stringify(instruction));
            }
        });
        if(process.env.QUEUE_ENABLED){
            const rendering          = new Rendering();
            rendering.complete     = false;
            rendering.lastUpdated  = new Date();
            rendering.instructions = instructions;
            await getRepository(Rendering).save(rendering);
        }
        res.json({});
    } catch(error){
        Logger.error(error);
        res.status(error.status|| 400).json(error);
    };
});

export default rainbowRouter;
