import React, { Component } from 'react';
import { Button, Segment } from 'semantic-ui-react';
import ThemingLayout from './ThemingLayout';
import TopNav from './component/TopNav';


class App extends Component {
  chgMode = () => {
    const element = document.body;
    element.classList.toggle("dark-mode");
    
    if (element.className === "dark-mode") {
      document.querySelector("#darkbtn").innerText = "밝게";   		
    } else {
      document.querySelector("#darkbtn").innerText = "어둡게";
    }
 }
  render() {
    return (
      <Segment>
        <Button id='darkbtn' onClick={this.chgMode}>어둡게</Button>
        <ThemingLayout />
        <TopNav />
      </Segment>
    );
  }
} 

export default App;
