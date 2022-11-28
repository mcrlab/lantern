import "reflect-metadata";
import * as dotenv        from "dotenv";
import * as express       from "express";
import * as helmet        from "helmet";
import {createConnection, getRepository} from "typeorm";
import Logger from "./lib/logger";
import morganMiddleware from "./config/morganMiddleWare";
import mqttRouter from "./routes/mqtt";

import * as http from 'http';
import { WebSocket } from 'ws';
import { Light } from "./entity/Light";

import { LightController } from "./lib/LightController";
import createLightRoutes from "./routes/light";
import createDisplayRoutes from "./routes/display";
import MQTTBroker from "./lib/mqtt";


const start = async ()=> {
  dotenv.config();
  const port = process.env.SERVER_PORT || '3001';

  await createConnection(); 


  const app = express();
  const broker = new MQTTBroker();
  const controller = new LightController(broker);
  await broker.init("API_Dev", (topic:string, message:string)=>controller.handleMessage(topic, message) );

  app.use(morganMiddleware);
  app.use(helmet());
  app.use(express.json());

  app.use("/api/mqtt", mqttRouter);
  app.use("/api/lights", createLightRoutes(broker, controller));
  app.use("/api/display", createDisplayRoutes(broker));

  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws) => {
    const data = await getRepository(Light).find( {
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