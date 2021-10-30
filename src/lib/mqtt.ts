import * as mqtt from 'mqtt';
import * as dotenv        from "dotenv";
import Logger from "./logger";

dotenv.config();

class MQTTBroker {
    clientId: string;
    client: mqtt.Client;

  constructor(clientId: string){
    this.clientId = clientId;
  }

  async init(callback) {
    const url = process.env.MQTT_URL;
    Logger.debug(`MQTT_URL: ${process.env.MQTT_URL}`);
    this.client  = await mqtt.connect(url, {"clientId": this.clientId});

    this.client.on('connect', () => {
      Logger.debug("Connected to MQTT broker");
      this.client.subscribe('connect');
      this.client.subscribe('ping');
    });

    this.client.on('message', (topic: string, message: string) => {
      Logger.debug(`Message recieved ${topic} ${message}`);
      callback(topic, message);
    });

    this.client
        .on('close', () => {
            Logger.warn('close');
        });
    this.client
        .on('reconnect', () => {
            Logger.warn('reconnect');
        });
    this.client
        .on('offline', () => {
            Logger.error('offline');
        });
    this.client
        .on('error', (error) => {
            Logger.error('error', error);
        });

  }

  publish(address: string, message: string) {
    Logger.debug(address, message);
    this.client.publish(address, message);
  }

}


const broker = new MQTTBroker("api");
export default broker;
