import "reflect-metadata";
import * as dotenv        from "dotenv";
import * as express       from "express";
import * as helmet        from "helmet";
import {createConnection, getRepository} from "typeorm";
import Logger from "./lib/logger";
import morganMiddleware from "./config/morganMiddleWare";
import mqttRouter from "./routes/mqtt";
import lightRouter from "./routes/light";
import colorRouter from "./routes/color";
import easingRouter from "./routes/easing";
import rainbowRouter from "./routes/rainbow";
import broker from "./lib/mqtt";
import { handleMessage } from "./lib/messageHandler";
import * as http from 'http';
import { WebSocket } from 'ws';
import { Light } from "./entity/Light";
import frameRouter from "./routes/frame";
import debugRouter from "./routes/debug";

const start = async ()=> {
  dotenv.config();
  const port = process.env.SERVER_PORT || '3001';

  await createConnection();
  await broker.init(handleMessage);

  const app = express();

  app.use(morganMiddleware);
  app.use(helmet());
  app.use(express.json());
  app.get("/logger", (_, res) => {
    Logger.error("This is an error log");
    Logger.warn("This is a warn log");
    Logger.info("This is a info log");
    Logger.http("This is a http log");
    Logger.debug("This is a debug log");

    res.send("Hello world");
  });

  app.use("/mqtt", mqttRouter);
  app.use("/lights", lightRouter);
  app.use("/colors", colorRouter);
  app.use("/easings", easingRouter);
  app.use("/frames", frameRouter);
  app.use("/rainbow", rainbowRouter);
  app.use("/debug", debugRouter);

  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws) => {
    const data = await getRepository(Light).find();
    ws.send(JSON.stringify(
      {
        "instruction": "ALL_LIGHTS",
        "data": { "lights": data }
      }
    ));

    // lightController.registerCallback((instruction, data)=>{
    //   wss.clients.forEach(function each(client) {
    //     if (client.readyState === WebSocket.OPEN) {
    //       client.send(JSON.stringify(
    //         {
    //           "instruction": instruction,
    //           "data": data
    //         }
    //       ));
    //     }
    //   });
    // });

  });

  server.listen(port, () => {
    Logger.debug( `Web server started at on port ${ port }` );
  });
}

start();