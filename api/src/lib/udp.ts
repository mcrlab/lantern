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
      Logger.debug('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
      callback("hello", info.address);
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
    let buf1 = Buffer.alloc(3);
    let color = hex2rgb(message);

    buf1 = color['r'];
    buf1 = color['g'];
    buf1 = color['b'];

    this.client.send(buf1, 9999, address, (error) => {
        if(error){
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
