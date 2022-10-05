import React from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LightItem from './LightItem'
import Light from './Light';

interface AppProps {
}
interface AppState {
  lights: Array<Light>
}

const client = new W3CWebSocket(`ws://${window.location.hostname}/lights`);

class App extends React.Component <AppProps, AppState>{
  constructor(props: any){
    super(props);
    this.state = {
      lights: []
    }
  }

  componentWillMount(){

    client.onopen = () => {
      console.log('WebSocket Client Connected');
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
  }

  render(){
    let list:any = [];
    this.state.lights.forEach((light:Light) => {
      list.push((<LightItem key={`light_${light.id}`} light={light} />))
    });


    return (
        <React.Fragment>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell >Version</TableCell>
                <TableCell>Platform</TableCell>
                <TableCell align="right">Last Updated</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list}
            </TableBody>
          </Table>
        </React.Fragment>
    );
  }
}

export default App;
