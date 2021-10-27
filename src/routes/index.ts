import * as express from "express";
import {Request, Response} from 'express';


export const register = (app: express.Application) => {
    app.get( "/", ( req: Request, res: Response ) => {
        res.send( "hello world" );
    });
}