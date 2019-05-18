import React, { Component } from 'react';
import '../App.css';
import Chat from './Chat';
import styled from 'styled-components';
import io from 'socket.io-client';
// import { ContextMenu, MenuItem, ContextMenuTrigger, SubMenu } from "react-contextmenu";

class App extends Component {
  constructor() {
    super();
    this.itemNumber = 1;
    this.state = {
        chatRoomEntered: 'main',
        chatItems: '',
        nickName: '',
        errorMessage: ''
    }
    this.socket = io.connect('https://volence.dev/', { path: '/node_apps/chat_app/socket.io'});
  }

  // Check if the nickname is already in use
  setChannel = (e) => {
    e.preventDefault();
    this.socket.emit('nickNameTest', this.state.nickName);
  }

  componentDidMount() {
    this.nicknameInput.focus();
    let that = this;
    // After the nickNameTest goes out, it respondes with either an error or not one
    // If there's an error display it and make the user select a new nickname
    // if not set up the channel and get rid of the background
    this.socket.on('nickNameValidation', function(err) {
      if (err) { 
        that.setState({errorMessage: <ErrorStyle>{err}</ErrorStyle>, nickName: ''});
        that.nicknameInput.focus();
      } else {
      document.querySelector('.backgroundHider').style.display = 'none';
      document.querySelector('.channelSelector').style.display = 'none';
      that.socket.emit('chat-select-initialize', that.state.chatRoomEntered, that.state.nickName);
      that.socket.off('nickNameValidation');
      }
    });
  }

  render() {
    return (
      <AppWrapper>
        <Chat key={this.itemNumber++} currentChatroom={this.state.chatRoomEntered || 'main'} nickName={this.state.nickName || 'poopboy'} socket={this.socket}></Chat>
        <BackgroundCover className="backgroundHider"/>
        <ChatRoomSelector className="channelSelector">
          <SelectorForm onSubmit={this.setChannel.bind(this)} className="chatStartForm">
            <h2>Please enter the chat you'd like to join</h2>
            <input value={this.state.chatRoomEntered} type="text" onChange={e => this.setState({chatRoomEntered: e.target.value})}></input>
            <h2>Create Account:</h2>
            <h3>Nickname:</h3>
            <input ref={(input) => { this.nicknameInput = input; }} value={this.state.nickName} type="text" onChange={e => this.setState({nickName: e.target.value})}></input>
            <NickNameChatSubmit type="submit" value="Submit" />
            {this.state.errorMessage}
          </SelectorForm>
        </ChatRoomSelector>
      </AppWrapper>
    );
  }
}

const ErrorStyle = styled.div`
  color: red;
  margin: 0 auto;
  text-align: center;
`

const AppWrapper = styled.div`
  height: 100vh;
  overflow: hidden;
`

const BackgroundCover = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(55, 55, 55, .4);
    z-index: 2;
`

const ChatRoomSelector = styled.div`
    position: absolute;
    background-color: white;
    width: 60vw;
    height: 60vh;
    z-index: 4;
    left: 20%;
    top: 20%;
    box-shadow:0px 0px 3px 3px #005eff inset,0px 0px 6px 6px #00d2ff inset,0px 0px 0px 9px #005eff inset, 0px 0px 15px black;
    background: rgb(85,147,255);
    background: linear-gradient(29deg, rgba(85,147,255,1) 0%, rgba(80,144,255,1) 18%, rgba(87,225,255,1) 100%);
`

const SelectorForm = styled.form`
     display: flex;
     flex-direction: column;
     justify-content: center;
     align-items: center;
`

const NickNameChatSubmit = styled.input`
    margin-top: 1rem;
`

export default App;
