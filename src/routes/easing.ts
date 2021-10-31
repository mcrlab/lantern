import * as express from "express";
import {Request, Response} from 'express';
import easings from "../lib/easings";

const easingRouter = express.Router()
.get('/', async (req: Request, res: Response) => {
    res.json(easings);
});

export default easingRouter;

