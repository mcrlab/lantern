import LightNotFoundError from "../exceptions/LightNotFoundError";
//import { getRepository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Light } from "../entity/Light";
import Logger from "./logger";
import MQTTBroker from "./mqtt";

export class LightController {
    callback: { (instruction: string, data: string): void; }
    broker: MQTTBroker;
    startTime: any;
    
    constructor(broker:MQTTBroker){
        this.broker = broker;
        this.startTime = Date.now();
        this.callback = (instruction:string, data: string)=> {
            Logger.warn("Default callback used");
        }
    }
    registerCallback(handler:(instruction: string, data: string) => void){
      this.callback = handler
    }

    async handleMessage (topic: string, message: string){

        let light = new Light();

        switch(topic){
            case "hello":
                let id = message.toString();
                light = await AppDataSource.getRepository(Light).findOne({where:{"address": id}});
                if(light){ 
                    light.lastUpdated = new Date();
                    await AppDataSource.getRepository(Light).save(light);
                    this.callback("UPDATE_LIGHT", JSON.stringify(light));
                    Logger.debug(`Light ${light.address} registered`);
                } else {
                    const newLight = new Light();
                    newLight.address = id;
                    newLight.color = "000000";
                    newLight.x = 0;
                    newLight.lastUpdated = new Date();
                    await AppDataSource.getRepository(Light).save(newLight);
                    this.callback("ADD_LIGHT", JSON.stringify(newLight));
                    Logger.debug("New light created");
                }
                return;
            default:
                return;
        }

    }

    async removeLight(lightId: number){
        const light = await AppDataSource.getRepository(Light).findOne({
            where: {id:lightId}
        });
        if(light){
            await AppDataSource.getRepository(Light).remove(light);
            this.callback("REMOVE_LIGHT", JSON.stringify(light));
        } else {
            throw new LightNotFoundError();
        }
    }

    async updateLightPosition(lightId: number, x:number){
        Logger.debug("Update light position");
        const light = await AppDataSource.getRepository(Light).findOne({
            where: {id:lightId}
        });
        if(light){
            light.x = x || 0;
            light.lastUpdated = new Date();
            await AppDataSource.getRepository(Light).save(light);
            this.callback("UPDATE_LIGHT", JSON.stringify(light));
        } else {
            throw new LightNotFoundError();
        }
    }
  }