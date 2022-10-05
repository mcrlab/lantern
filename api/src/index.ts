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
import createFrameRoutes from "./routes/frame";
import MQTTBroker from "./lib/mqtt";


const start = async ()=> {
  dotenv.config();
  const port = process.env.SERVER_PORT || '3001';

  await createConnection(); 


  const app = express();
  const broker = new MQTTBroker();
  const controller = new LightController(broker);
  await broker.init("API_Dev", (a,b)=>controller.handleMessage(a,b) );
  app.use(express.static("client/build"))
  app.use(morganMiddleware);
  app.use(helmet());
  app.use(express.json());

  app.use("/mqtt", mqttRouter);
  app.use("/lights", createLightRoutes(broker, controller));
  app.use("/frames", createFrameRoutes(broker));

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