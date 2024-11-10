import {connect, MqttClient}  from 'mqtt';
import * as dotenv        from "dotenv";
import Logger from "./logger";
import Broker from './Broker';

dotenv.config();

export default class MQTTBroker extends Broker{
    clientId: string;
    client: MqttClient;

  constructor(){
    super()
  }

  async init(clientId: string, callback: any) {
    
    const url = process.env.MQTT_URL;
    this.clientId = clientId;
    this.client  = connect(url, {"clientId": this.clientId});

    this.client.on('connect', () => {
      Logger.debug("Connected to MQTT broker");
      this.client.subscribe('hello');
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
    this.client.publish(`color/${address}`, message);
  }

}