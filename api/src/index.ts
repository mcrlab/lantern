import "reflect-metadata";
import * as dotenv        from "dotenv";
import * as express       from "express";
import Helmet from "helmet";
import { AppDataSource } from "./data-source";
import Logger from "./lib/logger";
import morganMiddleware from "./config/morganMiddleWare";

import * as http from 'http';
import { WebSocket } from 'ws';
import { Light } from "./entity/Light";

import { LightController } from "./lib/LightController";
import createLightRoutes from "./routes/light";
import createDisplayRoutes from "./routes/display";
import MQTTBroker from "./lib/mqtt";
import UDPBroker from "./lib/udp";

const start = async ()=> {
  dotenv.config();
  const port = process.env.SERVER_PORT || '3001';
  await AppDataSource.initialize()

  const app = express();
  const mqttBroker = new MQTTBroker();
  const udpBroker = new UDPBroker();

  const controller = new LightController(mqttBroker);

  await mqttBroker.init("API_Dev", (topic:string, message:string)=>controller.handleMessage(topic, message) );
  //udpBroker.init("udp", (topic:string, message:string)=>controller.handleMessage(topic, message) );

  app.use(morganMiddleware);
  app.use(Helmet());
  app.use(express.json());

  app.use("/api/lights", createLightRoutes(controller));
  app.use("/api/display", createDisplayRoutes(controller));

  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws) => {
    const data = await AppDataSource.getRepository(Light).find( {
      order: {
        x: "ASC",
        id: "ASC"
      }
    });
    ws.send(JSON.stringify(
      {
        "instruction": "ALL_LIGHTS",
        "data": { "lights": data }
      }
    ));
  });

  controller.registerCallback((instruction: string, data: any)=>{
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(
          {
            "instruction": instruction,
            "data": data
          }
        ));
      }
    });
  });
  
  server.listen(port, () => {
    Logger.info( `Web server started` );
  });
}

start();