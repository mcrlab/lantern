import React from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HighlightIcon from '@mui/icons-material/Highlight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Buffer } from 'buffer';
import Light from '../Light'
import AlertDialog from './confirmation';
import ConfigForm from './ConfigForm';


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
      this.up = this.up.bind(this);
      this.down = this.down.bind(this);
  
    }
  
    on(){
      fetch(`/api/lights/${this.props.light.id}`)
      .then(response => response.json())
      .then(data => console.log(data))
    }
  
    up(){
      fetch(`/api/lights/${this.props.light.id}/position`,{
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
            "x": this.props.light.x + 1.0
        })
      })
      .then(response => {
        response.json();
      })
      .then(json => {
        console.log(json)
      });
  
    }
    down(){
      fetch(`/api/lights/${this.props.light.id}/position`,{
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
            "x": this.props.light.x - 1.0
        })
      })
      .then(response => {
        response.json();
      })
      .then(json => {
        console.log(json)
      });
    }
  
    lightColor(color:any){
      fetch(`/api/display/all`,{
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
            "lights": [
                {
                    "id":this.props.light.id,
                    "color": color
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
      fetch(`/api/lights/${this.props.light.id}/restart`, {
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
      fetch(`/api/lights/${this.props.light.id}/update`, {
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
      fetch(`/api/lights/${this.props.light.id}/delete`,{
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
            <TableCell>
               <IconButton aria-label="down" onClick={this.down}>
                <KeyboardArrowUpIcon />
              </IconButton>
              {this.props.light.x}
              <IconButton aria-label="up" onClick={this.up}>
                <KeyboardArrowDownIcon />
              </IconButton>
              </TableCell>
            <TableCell>{this.props.light.version}</TableCell>
            <TableCell>{this.props.light.platform}</TableCell>
            <TableCell align="right">{new Date(this.props.light.lastUpdated).toLocaleTimeString('en-US')}</TableCell>
            <TableCell>
              <IconButton aria-label="poke" onClick={this.poke}>
                <HighlightIcon />
              </IconButton>

              <AlertDialog title={"Restart Light"} body={"Do you want to restart light "+this.props.light.id} confirmCB={this.restart}>
              <RestartAltIcon />
              </AlertDialog>

              <AlertDialog title={"Update Light"} body={"Do you want to update the firmware for light "+this.props.light.id} confirmCB={this.upgrade}>
              <SystemUpdateAltIcon />
              </AlertDialog>
              <AlertDialog title={"Remove Light"} body={"Do you want to delete light "+this.props.light.id} confirmCB={this.deleteLight}>
                <DeleteIcon />
              </AlertDialog>
            </TableCell>
          </TableRow>
        )
    }
  }
  export default LightItem;
  /*
                <ConfigForm title={"Light Config"} light={this.props.light} confirmCB={()=>{}}>
                <SystemUpdateAltIcon />
              </ConfigForm>
              */