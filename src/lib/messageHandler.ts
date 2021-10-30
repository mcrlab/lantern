import Logger from "./logger";
import "reflect-metadata";
import {getRepository} from "typeorm";
import {Light} from "../entity/Light";

export const handleMessage = async (topic: string, message: string) => {
    const data = JSON.parse(message.toString());
    const light = await getRepository(Light).findOne({"address":data.id});

      try {
        switch(topic){
          case "connect":
            if(light){
                Logger.debug("light found");
                light.lastUpdated = new Date();
                light.config = data.config || light.config;
                await getRepository(Light).save(light);

              } else {
                Logger.debug("New light created");
                const newLight = new Light();
                newLight.name = "Light";
                newLight.address = data.id;
                newLight.color = "000000";
                newLight.platform = data.platform || "unknown";
                newLight.x = 0;
                newLight.y = 0;
                newLight.sleep = 0;
                newLight.config = data.config || {};
                newLight.version = data.version || "-1";
                newLight.memory = data.memory || "-1";
                newLight.lastUpdated = new Date();
                await getRepository(Light).save(newLight);
              }
            return;
          case "ping":
            if(light){
                Logger.debug("light found");
                light.lastUpdated = new Date();
                light.color = data.color;
                light.voltage = data.voltage;
                await getRepository(Light).save(light);

              }
          default:
            return;
        }

      } catch (error) {
        Logger.error(error);
      }
  }
