import React from 'react';
import './App.css';

interface MyProps {
}

interface MyState {
  lights: any
}

class App extends React.Component <MyProps, MyState>{
  constructor(props: any){
    super(props);
    this.state = {
      lights: []
    }
  }

  componentDidMount(){
    fetch("/lights")
    .then(response => response.json())
    .then(data => {
      this.setState({
        lights: data
      })
    })  
  }

  render(){
    let list:any = [];
    this.state.lights.forEach((light:any) => {
      list.push((<h1>{light.address}</h1>))
    });
    return (
      <div className="App">
        <header className="App-header">
          {list}
        </header>
      </div>
    );
  }
}

export default App;
