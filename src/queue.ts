import "reflect-metadata";
import {createConnection, getRepository } from "typeorm";
import { Frame } from "./entity/Frame";
import { LightInstruction } from "./entity/LightInstruction";

import Logger from "./lib/logger";
import MQTTBroker from "./lib/mqtt";
const broker = new MQTTBroker();

async function getNextInstruction(){
    let wait = 10;
    const nextFrame = await getRepository(Frame)
                            .createQueryBuilder("frame")
                            .where("frame.complete = :isComplete", { isComplete: false })
                            .orderBy('frame.created', 'DESC')
                            .getOne();

    if(nextFrame){
        const instructions = await getRepository(LightInstruction)
                                    .createQueryBuilder("instruction")
                                    .select(["instruction.color",
                                            "instruction.time",
                                            "instruction.easing",
                                            "instruction.delay",
                                            "light.address"])
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
            if(wait < (instruction.instruction_delay + instruction.instruction_time)){
                wait = instruction.instruction_delay + instruction.instruction_time;
            }
            broker.publish(`color/${instruction.light_address}`,JSON.stringify(data));
        }
       nextFrame.complete = true;
       getRepository(Frame).save(nextFrame);
       Logger.debug("sent");
    }
    
    setTimeout(getNextInstruction, wait);
}

function handleMessage(topic:String,message:String){};

async function start(){
    if(process.env.QUEUE_ENABLED){
        await broker.init("Queue", handleMessage);
        await createConnection();
        getNextInstruction();
    }  else {
        Logger.info("DB Queue not enabled");
        process.exit(1);
    }
}

start();