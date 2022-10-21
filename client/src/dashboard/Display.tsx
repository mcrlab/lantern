import * as React from 'react';
import Title from './Title';
import Light from '../Light';
import Button from '@mui/material/Button';
interface DisplayProps {
  lights: Light[]
}

export default class Display extends React.Component <DisplayProps, {}> {
  constructor(props:DisplayProps){
    super(props);
    this.color = this.color.bind(this);
  }
  color(color:string){
    let colors:string[] = this.props.lights.map((light:Light)=>{
      return color
    });
    fetch(`/display`,{
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
          "colors": colors
        })
    })
    .then(response => {
      response.json();
    })
    .then(json => {
      console.log(json)
    });
  }
  render(){
    return (
      <React.Fragment>
        <Title>Display</Title>
        <Button onClick={()=>{this.color("FF0000")}}>Red</Button>
        <Button onClick={()=>{this.color("00FF00")}}>Green</Button>
        <Button onClick={()=>{this.color("0000FF")}}>Blue</Button>
      </React.Fragment>
    );
  }
}
