import { Button } from '@mui/material';
import * as React from 'react';
import Light from '../Light';

interface AnimationProps {
  lights: Light[]
}

interface AnimationState {
    connected: Boolean,
    frames: Frame[]
  }

interface Frame {
}


interface FrameState {
    color: string
}

class FrameUI extends React.Component <{},FrameState>{
    constructor(props:{}){
        super(props);
        this.state = {
            color: "000000"
        }
        this.setColor = this.setColor.bind(this);
        this.sendFrame = this.sendFrame.bind(this);
    }
    sendFrame(frame:Frame){
        fetch(`/display`,{
            method: "POST",
            headers: {
            "content-type": "application/json"
            },
            body: JSON.stringify({"colors":[this.state.color]})
        })
        .then(response => {
            response.json();
        })
        .then(json => {
            console.log(json)
        });  
      }
    
    setColor(){
        const currentColor = this.state.color;
        let newColor;

        if(currentColor === "000000"){
            newColor = "FFFFFF";
        } else {
            newColor ="000000";
        }

        this.setState({
            color: newColor
        });
    }
    render(){
        return (
            <React.Fragment>
                <Button onClick={this.setColor}>{this.state.color}</Button>
                <Button onClick={this.sendFrame}>Render</Button>
            </React.Fragment>
        )
    }
}

export default class Animation extends React.Component <AnimationProps, AnimationState> {
  constructor(props:AnimationProps){
    super(props);
    this.state ={
        connected: false,
        frames:[]
    }
    this.addFrame = this.addFrame.bind(this);
  }

  addFrame(){
    let frames = this.state.frames;
    
    const frame:Frame = {};
    frames.push(frame)
    this.setState({
        frames: frames
    });
  }

  render(){
    return (
      <React.Fragment>
          {this.state.frames.map((frame) => (
             <React.Fragment>
                <FrameUI />
             </React.Fragment>
          ))}
          <Button onClick={this.addFrame}>Add</Button>
          
      </React.Fragment>
    );
  }
}
