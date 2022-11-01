import { AnyNsRecord } from 'dns';
import * as React from 'react';
import Button from '@mui/material/Button';
import { IconButton } from '@mui/material';
import HighlightIcon from '@mui/icons-material/Highlight';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
interface BlinkState {
    on: boolean,
    playing: boolean,
    intervalFn: any ,
    frameNumber: number
}

export default class Blink extends React.Component <{},BlinkState>{
    constructor(props:{}){
        super(props);
        this.bounce = this.bounce.bind(this);
        this.play = this.play.bind(this);
        this.stop = this.stop.bind(this);
        this.pause = this.pause.bind(this)
        this.stepForward = this.stepForward.bind(this)
        this.state = {
            on: false,
            playing: false,
            intervalFn: undefined,
            frameNumber: 0
        };
    }
    play(){
        const intervalFn = setInterval(this.bounce, 1000);
        this.setState({
            playing: true,
            intervalFn: intervalFn
        });
    }
    stop(){
        if(this.state.intervalFn){
            clearInterval(this.state.intervalFn);
        }
        this.setState({
            playing: false,
            intervalFn: undefined,
            frameNumber: 0
        });
    }
    stepForward(){
        this.bounce();
    }
    pause(){
        if(this.state.intervalFn){
            clearInterval(this.state.intervalFn);
        }
        this.setState({
            playing: false,
            intervalFn: undefined
        });
    }
    async bounce(){
        const on = !this.state.on;
        let frameNumber = this.state.frameNumber;
        const color = (on)?"FFFFFF":"000000";

        let response = await fetch(`/api/display/color`,{
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({
                "color": color
              })
          });
        frameNumber++;
        this.setState({
            on: on,
            frameNumber: frameNumber
        });
    }

    render(): React.ReactNode {
        return (
            <div>
            <IconButton onClick={this.play}>
                <PlayArrowIcon />
            </IconButton>
            <IconButton onClick={this.pause}>
                <PauseIcon />
            </IconButton>
            <IconButton onClick={this.stop}>
                <StopIcon />
            </IconButton>
            <IconButton onClick={this.stepForward}>
                <SkipNextIcon />
            </IconButton>
            {this.state.frameNumber.toString()}
            {this.state.playing.toString()}
            {this.state.on.toString()}
            </div>
        )
    }
}

