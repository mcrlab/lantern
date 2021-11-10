import { readlinkSync } from 'fs';
import * as redis from 'redis';
import Logger from './logger';
const { promisify } = require("util");

let redisReady = false;

let redisClient = redis.createClient({
    host: process.env.REDIS_URL || '127.0.0.1',
    port: 6379
});

redisClient.on("error", (err) => {
   Logger.error("error", err)
});

redisClient.on("connect", (err) => {
    Logger.info("Redis Connected");
});

redisClient.on("ready", (err) => {
    redisReady = true;
    Logger.info("Redis Ready");
});

const pushAsync = promisify(redisClient.rpush).bind(redisClient);
const popAsync = promisify(redisClient.lpop).bind(redisClient);
const lrangeAsync = promisify(redisClient.lrange).bind(redisClient);
const lengthAsync = promisify(redisClient.llen).bind(redisClient);


let add = async (wait, instructionSet)=>{
    if(redisReady){
        const data = {
            wait: wait,
            instructionSet: instructionSet
        };
        
        await pushAsync(['light-queue', JSON.stringify(data)]);
    }    
}

let pop = async ()=> {
    let data = await popAsync(['light-queue']);
    if(data){
        const obj = JSON.parse(data)
        return obj;
    }
    return null;
}
let len = async ()=> {
     let len = await lengthAsync(['light-queue']);
     return len;
 }

let clear = async ()=> {
    return
}

export default {
    add,
    pop,
    len,
    clear
}