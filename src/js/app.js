'use strict'

import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';

var app = app || {};

app.state = {};
app.ui = {};
app.ui.chatApp = document.getElementById('chatApp')
app.ui.chatLauncher = document.getElementById('chatLauncher');
app.ui.chatWindow = document.getElementById('chatWindow');
app.state.messages = []

const chatServerURL = 'http://localhost:4000';
//const chatServerURL = 'https://louisbourque-chat.herokuapp.com/'

class ChatMessage extends React.Component {
  render() {
    if(this.props.msg.type=='msg'){
      return (
        <div className="chatmessage">
          <strong>{this.props.msg.from}:</strong> {this.props.msg.msg}
        </div>
      );
    }else{
      return (
        <div className="chatmessage">
          <em>{this.props.msg.name+ " " +this.props.msg.action}</em>
        </div>
      );
    }
  }
}

const ChatWindow =  React.createClass({
  handleUserMessage: function(event) {
    // When shift and enter key is presseds
    if (event.shiftKey && event.keyCode === 13) {
      var msg = this.refs.textArea.value.trim();
      if (msg !== '') {
        // call the sendmessages of ChatContainer throught the props
        sendMessage(msg);
      }
      // Prevent default and clear the textarea
      event.preventDefault();
      this.refs.textArea.value = null;
    }
  },
  handleJoinName: function(event) {
    var name = this.refs.joinName.value.trim();
    if(name.length > 0){
      this.refs.joinButton.disabled = false;
      if (event.keyCode === 13) {
        this.handleJoinButton();
      }
    }else{
      this.refs.joinButton.disabled = true;
    }
  },
  handleJoinButton: function() {
    var name = this.refs.joinName.value.trim();
    if (name !== '') {
      joinChat(name);
    }
    this.refs.joinName.value = null;
  },
  render: function() {
    const messageNodes = this.props.messagesList.map(function(result) {
      return (
        <ChatMessage key={result.time} msg={result} />
      );
    });
    if(typeof(app.socket)=='undefined'){
      return (
        <div className="chatWindowInner">
          <div className="chatHeader">
            <div className="title">Join Chat</div>
            <button className="closeButton" onClick={hideChat}>X</button>
          </div>
          <div className="joinChat">
            <input type="text" id="name" ref="joinName" onKeyUp={this.handleJoinName} placeholder="Type your name" />
            <button className="joinButton" ref="joinButton" onClick={this.handleJoinButton}>Join</button>
          </div>
        </div>
      );
    }else{
      return (
        <div className="chatWindowInner">
          <div className="chatHeader">
            <div className="title">Chat</div>
            <button className="closeButton" onClick={hideChat}>X</button>
          </div>
          <div className="messages">
            {messageNodes}
          </div>
          <div className="chatFooter">
            <textarea id="chatMsg" ref="textArea" onKeyDown={this.handleUserMessage} placeholder="Type your message. Press shift + Enter to send" />
          </div>
        </div>
      );
    }
  }
});

const renderChatUI = () => {
  ReactDOM.render(
    <ChatWindow messagesList={app.state.messages} />,
    app.ui.chatWindow
  );
}

const appendMessage = (changes) => {
  app.state.messages = app.state.messages.concat(changes);
  renderChatUI();
}

const joinChat = (name) => {
  app.name = name;
  app.socket = io(chatServerURL);
  app.socket.emit('join', {'name':app.name});
  app.socket.on('chat message', function(data){
    appendMessage([data]);
  });
  app.socket.on('log', function(data){
    appendMessage([data]);
  });
  renderChatUI();
}

const showChat = () => {
  addClass(app.ui.chatLauncher,'hide');
  renderChatUI();
  removeClass(app.ui.chatWindow,'hide');
}
const hideChat = () => {
  addClass(app.ui.chatWindow,'hide');
  removeClass(app.ui.chatLauncher,'hide');
}
const sendMessage = (message) => {
  app.socket.emit('chat message', {'msg':message});
}

window.showChat = function(){
  showChat();
}
window.hideChat = function(){
  hideChat();
}


/*
 * Helper Functions
 */

function hasClass(el, className) {
	    return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className);
	}

	function addClass(el, className) {
	    if (el.classList) el.classList.add(className);
	    else if (!hasClass(el, className)) el.className += ' ' + className;
	}

	function removeClass(el, className) {
	    if (el.classList) el.classList.remove(className);
	    else el.className = el.className.replace(new RegExp('\\b'+ className+'\\b', 'g'), '');
	}

//window.showChat();
