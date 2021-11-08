import * as express from "express";
import {Request, Response} from 'express';
import "reflect-metadata";
import {getRepository} from "typeorm";
import {User} from "../entity/User";

export const register =  (app: express.Application) => {
    app.get( "/api", async ( req: Request, res: Response ) => {
        const data = await getRepository(User).find();
        res.json( data );
    });

    app.get( "/api/:user", async ( req: Request, res: Response ) => {
        const id = req.params.user;
        const data = await getRepository(User).findOne(id);

        if(data){
            res.json( data );
        } else {
            res.status(404).send("Sorry can't find that!")
        }
    });

    app.put( "/api" , async ( req: Request, res: Response ) => {
        const user = new User();
        user.firstName = "James";
        user.lastName = "Linnegar";
        user.age = 37;

        await getRepository(User).save(user);

        res.json("Hello world");
    });

    app.delete( "/api/:user" , async (req: Request, res: Response ) => {
        const id = req.params.user;
        const user = await getRepository(User).findOne(id);
        if(user){
            await getRepository(User).remove(user);
        }
    });
}