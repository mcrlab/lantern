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
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { Buffer } from 'buffer';


interface AppProps {
}
interface AppState {
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
          allLights.sort((a:Light,b:Light) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
          this.setState({
            lights: allLights
          });
          break;
          
        case 'UPDATE_LIGHT':
          let updatedLight:Light = JSON.parse(dataFromServer.data);
          let updated = lights.map((light:Light) => {
            if (light.id ===dataFromServer.data.id) {
              return Object.assign(light, updatedLight);
            }
            return light
          });
          this.setState({
            lights: updated
          });
          break;

        case 'ADD_LIGHT':
          const light:Light = JSON.parse(dataFromServer.data);
          console.log(light);

          lights.push( light );
          this.setState({
            lights: lights
          });
          break;

        case 'REMOVE_LIGHT':
          let lightToRemove:Light = JSON.parse(dataFromServer.data);
          console.log(lightToRemove);
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
      console.log(light);
      list.push((<LightItem key={`light_${light.id}`} light={light} />))
    });
    //return (<Dashboard />)

    return (
        <React.Fragment>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Address</TableCell>
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
    this.upgrade = this.upgrade.bind(this);

  }

  on(){
    fetch(`/lights/${this.props.light.id}`)
    .then(response => response.json())
    .then(data => console.log(data))
  }

  lightColor(color:any){
    fetch(`/frames/all`,{
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
          "lights": [
              {
                  "id":this.props.light.id,
                  "color": "00FF00"
              }
          ]
      })
    })
    .then(response => {
      response.json();
    })
    .then(json => {
      console.log(json)
    });
  }
  poke(){
   this.lightColor("FF0000")
   setTimeout(()=>{
    this.lightColor("000000")
   },
   1500);
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
  
  upgrade(){
    fetch(`/lights/${this.props.light.id}/update`, {
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
          <TableCell>{this.props.light.address}</TableCell>
          <TableCell>{this.props.light.x}</TableCell>
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
            <IconButton aria-label="Upgrade" onClick={this.upgrade}>
              <SystemUpdateAltIcon />
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
