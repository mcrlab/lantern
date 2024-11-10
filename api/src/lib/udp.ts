import * as dgram from 'node:dgram';
const { Buffer } = require('node:buffer');
import Broker from './Broker';
import Logger from "../lib/logger";

export default class UDPBroker extends Broker{
  client: dgram.Socket

  constructor(){
    super()
  }

  init(clientid: string, callback: any){
   this.client = dgram.createSocket('udp4');  

    // emits when any error occurs
    this.client.on('error',function(error){
      Logger.debug('Error: ' + error);
      this.client.close();
    });

    // emits on new datagram msg
    this.client.on('message',(msg: string, info: any) => {
      Logger.debug('Data received from client : ' + msg.toString());
      Logger.debug(`Received ${msg.length} bytes from ${info.address}:${info.port}\n`);
      callback("hello", info.address + ":" + info.port);
    });

    //emits when socket is ready and listening for datagram msgs
    this.client.on('listening',()=>{
      var address = this.client.address();
      var port = address.port;
      var family = address.family;
      var ipaddr = address.address;
      Logger.debug('Server is listening at port' + port);
      Logger.debug('Server ip :' + ipaddr);
      Logger.debug('Server is IP4/IP6 : ' + family);
    });

    this.client.on('close',()=>{
      Logger.debug('Socket is closed !');
    });

    this.client.bind(9999);

  }

  publish(address: string, message: string){
    let buf = Buffer.alloc(3);
    let color = hex2rgb(message);

    buf[0] = color['r'];
    buf[1] = color['g'];
    buf[2] = color['b'];

    let data = address.split(":");
    Logger.warn(`sending to ${address} this ${color}`)
    this.client.send(buf, Number(data[1]), data[0], (error) => {
        if(error){
          Logger.warn("error!!!");
            //this.client.close();
        }
    });
  }
}

const hex2rgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return { r, g, b };
}
