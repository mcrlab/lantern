import * as express from "express";
import {Request, Response} from 'express';
import "reflect-metadata";
import {getRepository} from "typeorm";
import {MQTTUser} from "../entity/MQTTUser";
import Logger from "../lib/logger";
import * as pbkdf2  from 'pbkdf2';

const mySalt = "mysecretsalthere";

function toHASH(password: string){
    const algorithm = "sha512";
    const iterations = 100000;
    const derivedKey = pbkdf2.pbkdf2Sync(password, mySalt, iterations, 64, algorithm)
    const hash = derivedKey.toString('base64');
    const salt64 = Buffer.from(mySalt).toString("base64");
    return `PBKDF2$${algorithm}$${iterations}$${salt64}$${hash}`;
}

const mqttRouter = express.Router()
.get('/', async (req: Request, res: Response) => {
    const users = await getRepository(MQTTUser).find();
    res.json(users);
})
.post('/', async (req: Request, res: Response) => {
    const user = new MQTTUser();
    user.username = req.body.username;
    user.password = toHASH(req.body.password);
    user.isActive = true;
    user.isAdmin = false;

    const data = await getRepository(MQTTUser).save(user);
    res.json({});
    Logger.debug(data);
});

export default mqttRouter;

