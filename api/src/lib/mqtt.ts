import {connect, MqttClient}  from 'mqtt';
import * as dotenv        from "dotenv";
import Logger from "./logger";

dotenv.config();

export default class MQTTBroker {
    clientId: string;
    client: MqttClient;

  constructor(){}

  async init(clientId: string, callback: any) {
    
    const url = process.env.MQTT_URL;
    this.clientId = clientId;
    this.client  = connect(url, {"clientId": this.clientId});

    this.client.on('connect', () => {
      Logger.info("Connected to MQTT broker");
      this.client.subscribe('hello');
      this.client.subscribe('ping');
    });

    this.client.on('message', (topic: any, message: any) => {
      Logger.debug(`Message recieved ${topic} ${message}`);
      callback(topic, message);
    });

    this.client
        .on('close', () => {
            Logger.warn('Closing MQTT Broker connection');
        });
    this.client
        .on('reconnect', () => {
            Logger.warn('Reconnecting to MQTT Broker');
        });
    this.client
        .on('offline', () => {
            Logger.error('Offline Broker connection');
        });
    this.client
        .on('error', (error) => {
            Logger.error('MQTT Error', error);
        });

  }

  publish(address: string, message: string) {
    Logger.debug(`${address} ${message}`);
    this.client.publish(address, message);
  }

}