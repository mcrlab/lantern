import * as mqtt from 'mqtt';
import * as dotenv        from "dotenv";
import Logger from "./logger";

dotenv.config();

class MQTTBroker {
    clientId: string;
    client: mqtt.Client;

  constructor(){}

  async init(clientId: string, callback: any) {
    
    const url = process.env.MQTT_URL;
    this.clientId = clientId;
    this.client  = mqtt.connect(url, {"clientId": this.clientId});

    this.client.on('connect', () => {
      Logger.info("Connected to MQTT broker");
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
    Logger.debug(`${address} ${message}`);
    this.client.publish(address, message);
  }

}

const broker = new MQTTBroker();
export default broker;
