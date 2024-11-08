import LightNotFoundError from "../exceptions/LightNotFoundError";
import { getRepository } from "typeorm";
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
                light = await getRepository(Light).findOne({"address": id});
                if(light){ 
                    light.lastUpdated = new Date();
                    await getRepository(Light).save(light);
                    this.callback("UPDATE_LIGHT", JSON.stringify(light));
                    Logger.debug(`Light ${light.address} registered`);
                } else {
                    const newLight = new Light();
                    newLight.name = id;
                    newLight.address = id;
                    newLight.color = "000000";
                    newLight.x = 0;
                    newLight.lastUpdated = new Date();
                    await getRepository(Light).save(newLight);
                    this.callback("ADD_LIGHT", JSON.stringify(newLight));
                    Logger.debug("New light created");
                }
                return;
            case "register":        
                let data = JSON.parse(message.toString());
                light = await getRepository(Light).findOne({"address":data.id});
                if(light){ 
                    light.lastUpdated = new Date();
                    await getRepository(Light).save(light);
                    this.callback("UPDATE_LIGHT", JSON.stringify(light));
                    Logger.debug(`Light ${light.address} registered`);
                } else {
                    const newLight = new Light();
                    newLight.name = "Light";
                    newLight.address = data.id;
                    newLight.color = "000000";
                    newLight.lastUpdated = new Date();
                    await getRepository(Light).save(newLight);
                    this.callback("ADD_LIGHT", JSON.stringify(newLight));
                    Logger.debug("New light created");
                }
                return;
            case "ping":
                let pingdata = JSON.parse(message.toString());
                light = await getRepository(Light).findOne({"address":pingdata.id});
                if(light){
                    light.lastUpdated = new Date();
                    light.color = pingdata.color;
                    await getRepository(Light).save(light);
                    this.callback("UPDATE_LIGHT", JSON.stringify(light));
                    Logger.debug(`Light ${light.address} pinged`);
                    }
            case "pong":
                light = await getRepository(Light).findOne({"address":message.toString()});
                if(!light){ 
                    const newLight = new Light();
                    newLight.name = "Light";
                    newLight.address = data;
                    newLight.color = "000000";
                    newLight.x = 0;
                    newLight.lastUpdated = new Date();
                    await getRepository(Light).save(newLight);
                    this.callback("ADD_LIGHT", JSON.stringify(newLight));
                    Logger.debug("New light created");
                }
            default:
            return;
        }

    }

    async removeLight(lightId: number){
        const light = await getRepository(Light).findOne(lightId);
        if(light){
            await getRepository(Light).remove(light);
            this.callback("REMOVE_LIGHT", JSON.stringify(light));
        } else {
            throw new LightNotFoundError();
        }
    }

    async updateLightPosition(lightId: number, x:number){
        Logger.debug("Update light position");
        const light = await getRepository(Light).findOne(lightId);
        if(light){
            light.x = x || 0;
            light.lastUpdated = new Date();
            await getRepository(Light).save(light);
            this.callback("UPDATE_LIGHT", JSON.stringify(light));
        } else {
            throw new LightNotFoundError();
        }
    }
  }