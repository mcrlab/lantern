import React from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import HighlightIcon from '@mui/icons-material/Highlight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Buffer } from 'buffer';

interface AppProps {
}
interface AppState {
  client: W3CWebSocket
  lights: Array<Light>
}

interface Config {
  VIEW_PIN: Number,
  NUMBER_OF_PIXELS: Number,
  RENDER_INTERVAL: Number,
  SLEEP_INTERVAL: Number,
  BACKUP_INTERVAL: Number,
}

interface Light {
  x: Number,
  y: Number,
  id: Number,
  address: String,
  name: String,
  color: String,
  version: String,
  platform: String,
  memory: Number,
  sleep: Number,
  lastUpdated: String,
  config: Config
}

class App extends React.Component <AppProps, AppState>{
  constructor(props: any){
    super(props);

    this.state = {
      client: new W3CWebSocket(`ws://localhost/lights`),
      lights: []
    }
  }

  componentDidMount(){

    this.state.client.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    this.state.client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data.toString());
      let lights = this.state.lights;
      switch(dataFromServer.instruction){
        case 'ALL_LIGHTS':
          let allLights:Array<Light> = [];
          dataFromServer.data.lights.forEach((lightData:Light)=>{
            allLights.push(lightData);
          });
          allLights.sort((a:Light,b:Light) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
          this.setState({
            lights: allLights
          });
          break;
          
        case 'UPDATE_LIGHT':
          let updated = lights.map((light:Light) => {
            if (light.id ===dataFromServer.data.id) {
              return Object.assign(light, dataFromServer.data);
            }
            return light
            
          });
          this.setState({
            lights: updated
          });
          break;

        case 'ADD_LIGHT':
          lights.push( dataFromServer.data );
          this.setState({
            lights: lights
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

interface LightItemProps {
  light: Light
}

class LightItem extends React.Component <LightItemProps, {}>{
  constructor(props:LightItemProps){
    super(props);
    this.on = this.on.bind(this);
    this.deleteLight = this.deleteLight.bind(this);
    this.poke = this.poke.bind(this);
    this.restart = this.restart.bind(this);
  }

  on(){
    fetch(`/lights/${this.props.light.id}`)
    .then(response => response.json())
    .then(data => console.log(data))
  }

  poke(){
    fetch(`/lights/${this.props.light.id}`,{
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        "color": "FF0000",
        "time": 500,
        "delay": 10
        })
    })
    .then(response => {
      response.json();
    })
    .then(json => {
      console.log(json)
    });
  }

  restart(){
    fetch(`/lights/${this.props.light.id}/restart`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      }
    })
    .then(response => {
      response.json()
    })
    .then(json => {
      console.log(json);
    })
  }

  deleteLight(){
    fetch(`/lights/${this.props.light.id}/delete`,{
        method: "POST",
        headers: {
            "content-type": "application/json",
            "Authorization":'Basic ' + Buffer.from("lantern:password").toString('base64')
        },
        body: "{}"
    })
    .then(response=> {
        response.json();
    })
    .then(json => {
        console.log(json);
    })
  }

  render(): React.ReactNode {
    return (
        <TableRow key={"light"+this.props.light.id}>
          <TableCell>{this.props.light.id}</TableCell>
          <TableCell>{this.props.light.version}</TableCell>
          <TableCell>{this.props.light.platform}</TableCell>
          <TableCell align="right">{`${this.props.light.lastUpdated}`}</TableCell>
          <TableCell>
            <IconButton aria-label="poke" onClick={this.poke}>
              <HighlightIcon />
            </IconButton>
            <IconButton aria-label="restart" onClick={this.restart}>
              <RestartAltIcon />
            </IconButton>
            <IconButton aria-label="delete" onClick={this.deleteLight}>
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      )
  }
}

export default App;
