import * as dotenv        from "dotenv";
import * as express       from "express";
import * as helmet        from "helmet";
import {createConnection} from "typeorm";
import Logger from "./lib/logger";
import morganMiddleware from "./config/morganMiddleWare";
import mqttRouter from "./routes/mqtt";
import lightRouter from "./routes/light";
import colorRouter from "./routes/color";
import easingRouter from "./routes/easing";

import broker from "./lib/mqtt";
import { handleMessage } from "./lib/messageHandler";

const start = async ()=> {
  dotenv.config();
  const port = process.env.SERVER_PORT;

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
  app.listen( port, () => {
    Logger.debug( `server started at http://localhost:${ port }` );
  } );
}

start();