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
        setInterval(()=>{this.updateLightTimerOffets()}, parseInt(process.env.SYNC_INTERVAL) || 30000);
    }
    registerCallback(handler:(instruction: string, data: string) => void){
      this.callback = handler
    }

    async handleMessage (topic: string, message: string){
        const data = JSON.parse(message.toString());
        const light = await getRepository(Light).findOne({"address":data.id});

        switch(topic){
            case "connect":
            if(light){ 
                light.lastUpdated = new Date();
                light.config = data.config || light.config;
                light.memory = data.memory;
                light.version = data.version

                await getRepository(Light).save(light);
                this.callback("UPDATE_LIGHT", JSON.stringify(light));
                Logger.debug(`Light ${light.address} connected`);
                } else {
                const newLight = new Light();
                newLight.name = "Light";
                newLight.address = data.id;
                newLight.color = "000000";
                newLight.platform = data.platform || "unknown";
                newLight.x = 0;
                newLight.sleep = 0;
                newLight.config = data.config || {};
                newLight.version = data.version || "-1";
                newLight.memory = data.memory || "-1";
                newLight.lastUpdated = new Date();
                await getRepository(Light).save(newLight);
                this.callback("ADD_LIGHT", JSON.stringify(newLight));
                Logger.debug("New light created");
                this.updateLightTimerOffets();
                }
            return;
            case "ping":
            if(light){
                light.lastUpdated = new Date();
                light.color = data.color;
                await getRepository(Light).save(light);
                this.callback("UPDATE_LIGHT", JSON.stringify(light));
                Logger.debug(`Light ${light.address} pinged`);
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
    
    async sleepLight(lightId: number, seconds: number){
        const light = await getRepository(Light).findOne(lightId);
        if(light){
            light.sleep = seconds;
            await getRepository(Light).save(light);
            const data = {
                "seconds": seconds
            }
            this.broker.publish(`sleep/${light.address}`,JSON.stringify(data));
            this.callback("UPDATE_LIGHT", JSON.stringify(light));

        } else {
            throw new LightNotFoundError();
        }
    }

    async restartLight(lightId: number){
        const light = await getRepository(Light).findOne(lightId);
        if(light){
            this.broker.publish(`restart/${light.address}`, "{}");
        } else {
            throw new LightNotFoundError();
        }
    }

    async updateLightPosition(lightId: number, x:number, y:number){
        Logger.debug("Update light position");
        const light = await getRepository(Light).findOne(lightId);
        if(light){
            light.x = x || 0;
            await getRepository(Light).save(light);
            this.callback("UPDATE_LIGHT", JSON.stringify(light));
        } else {
            throw new LightNotFoundError();
        }
    }

    async updateLightConfig(lightId: number, config: any){
        const light = await getRepository(Light).findOne(lightId);
        if(light){
            this.broker.publish(`config/${light.address}`, JSON.stringify(config));
            this.callback("UPDATE_LIGHT", JSON.stringify(light));
        } else {
            throw new LightNotFoundError();
        }
    }

    async updateLightFirmware(lightId: number){
        Logger.debug("Update light firmware");
        const light = await getRepository(Light).findOne(lightId);
        if(light){
            this.broker.publish(`update/${light.address}`, "{}");
        } else {
            throw new LightNotFoundError();
        }
    }
    async updateLightTimerOffets(){
        Logger.debug("Upding light timer offsets");
        let msSinceStart = Math.ceil(process.uptime() * 1000); // milliseconds since process started
        this.broker.publish('sync', msSinceStart.toString());
    }
  }