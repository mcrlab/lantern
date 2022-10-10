import React from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import Light from './Light';
import Dashboard from './dashboard/Dashboard';

interface AppProps {
}
interface AppState {
  lights: Array<Light>,
  connected: Boolean,
  socket?: W3CWebSocket
}

class App extends React.Component <AppProps, AppState>{
  constructor(props: any){
    super(props);
    this.state = {
      lights: [],
      connected: true
    }
    this.connect = this.connect.bind(this);
    this.check = this.check.bind(this);
  }

  check (){
    const { socket } = this.state;
    if (!socket || socket.readyState == WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.

  }

  connect(){
    var client = new W3CWebSocket(`wss://${window.location.hostname}/lights`);
    var connectInterval:any;
    var that = this;
    client.onopen = () => {
      console.log('WebSocket Client Connected');
      this.setState({socket:client, connected:true});
      clearInterval(connectInterval);
    };

    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data.toString());
      let lights = this.state.lights;

      switch(dataFromServer.instruction){
        case 'ALL_LIGHTS':
          let allLights:Array<Light> = [];
          dataFromServer.data.lights.forEach((lightData:Light)=>{
            allLights.push(lightData);
          });

          this.setState({
            lights: allLights
          });
          break;
          
        case 'UPDATE_LIGHT':
          let updatedLight:Light = JSON.parse(dataFromServer.data);
          let updated = lights.map((light:Light) => {
            if (light.id ===updatedLight.id) {
              return Object.assign(light, updatedLight);
            }
            return light
          });
          updated.sort((a, b) => (a.x > b.x) ? 1 : -1);
          this.setState({
            lights: updated
          });
          break;

        case 'ADD_LIGHT':
          const light:Light = JSON.parse(dataFromServer.data);

          lights.push( light );
          lights.sort((a, b) => (a.x > b.x) ? 1 : -1);
          this.setState({
            lights: lights
          });
          break;

        case 'REMOVE_LIGHT':
          let lightToRemove:Light = JSON.parse(dataFromServer.data);

          let updateLights:Array<Light> = lights.filter((light:Light) => {
            return (light.address !== lightToRemove.address);
          });
          this.setState({
            lights: updateLights
          });
          break;

        default:
          break;
      }
    }
    client.onerror = function() {
      console.log('Connection Error');
      client.close();
    };

    client.onclose = function(){
      console.log("Disconnected");
      that.setState({
        connected:false
      });
      connectInterval = setTimeout(that.check, Math.min(10000, 250));
    }
  }

  componentDidMount(){  
    this.connect();
  }

  render(){
    return (
        <React.Fragment>
          <Dashboard lights={this.state.lights} connected={this.state.connected} />
        </React.Fragment>
    );
  }
}

export default App;
