import * as React from 'react';
import Title from './Title';
import Light from '../Light';
import Button from '@mui/material/Button';
import Blink from './Blink';

interface DisplayProps {
  lights: Light[]
}
interface DisplayState {
  interval: number
  fn: any,
  on: boolean
}
export default class Display extends React.Component <DisplayProps, DisplayState> {
  constructor(props:DisplayProps){
    super(props);
    this.color = this.color.bind(this);
    this.state = {
      interval: 0,
      fn: ()=>{},
      on: false
    }
  }

  async color(color:string){
    let colors:string[] = this.props.lights.map((light:Light)=>{
      return color
    });
    let response = await fetch(`/api/display/color`,{
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
          "color": color
        })
    });
    
  }
  render(){
    return (
      <React.Fragment>
        <Title>Display</Title>
        <Button onClick={()=>{this.color("FF0000")}}>Red</Button>
        <Button onClick={()=>{this.color("00FF00")}}>Green</Button>
        <Button onClick={()=>{this.color("0000FF")}}>Blue</Button>
        <Blink />
      </React.Fragment>
    );
  }
}
