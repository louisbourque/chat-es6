'use strict'

import React from 'react';
import ReactDOM from 'react-dom';

var app = app || {};

app.state = {};
app.ui = {};
app.ui.chatApp = document.getElementById('chatApp')
app.ui.chatLauncher = document.getElementById('chatLauncher');
app.ui.chatWindow = document.getElementById('chatWindow');

// new Date().getTime()
app.state.messages = [{'from':'TestArr','m':'Test Messsage','t':1476669057568},{'from':'Test','m':'Test Messsage 2','t':1476669070617}]

class ChatMessage extends React.Component {
  render() {
    return (
      <div className="chatmessage">
        {this.props.msg.from} said: {this.props.msg.m}
      </div>
    );
  }
}

class ChatWindow extends React.Component {
  render() {
    var messageNodes = this.props.messagesList.map(function(result) {
      return (
        <ChatMessage key={result.t} msg={result} />
      );
    });
    return (
      <div className="chatWindowInner">
        {messageNodes}
      </div>
    );
  }
}

const renderChatUI = () => {
  ReactDOM.render(
    <ChatWindow messagesList={app.state.messages} />,
    app.ui.chatWindow
  );
}

const setState = (changes) => {
  Object.assign(app.state, changes);
  renderChatUI()
}

const renderChat = () => {
  addClass(app.ui.chatLauncher,'hide');
  renderChatUI();
  removeClass(app.ui.chatWindow,'hide');
}
const hideChat = () => {
  addClass(app.ui.chatWindow,'hide');
  removeClass(app.ui.chatLauncher,'hide');
}

window.showChat = function(){
  renderChat();
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

//window.launchChat();
