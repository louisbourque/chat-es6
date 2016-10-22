'use strict'

import Vue from 'vue';
import io from 'socket.io-client';

const chatServerURL = 'http://localhost:4000';
//const chatServerURL = 'https://louisbourque-chat.herokuapp.com/'

Vue.component('chat-message', {
  template: `<div v-if="message.type=='msg'" class="chatmessage" :class="{'message-so-far':!message.complete}">
              <strong>{{message.from}}:</strong> {{message.msg}}
            </div>
            <div v-else class="chatmessage">
              <em>{{message.name+ " " +message.action}}</em>
            </div>`,
  props: ['message'],

});

Vue.component('chat-window-inner', {
  template: `<div v-if="!connected" class="chatWindowInner">
              <div class="chatHeader">
                <div class="title">Join Chat</div>
                <button class="closeButton" v-on:click="handleHideChat">X</button>
              </div>
              <div class="joinChat">
                <input type="text" id="name" ref="joinName" autofocus v-on:keyup="handleJoinName" placeholder="Type your name" />
                <button class="joinButton" ref="joinButton" v-on:click="handleJoinButton" disabled>Join</button>
              </div>
            </div>
            <div v-else class="chatWindowInner">
              <div class="chatHeader">
                <div class="title">Chat</div>
                <button class="closeButton" v-on:click=handleHideChat>X</button>
              </div>
              <div class="messages">
                <template v-for="message in messages">
                  <chat-message v-bind:message="message"></chat-message>
                </template>
                <template v-for="message in messagessofar">
                  <chat-message v-bind:message="message"></chat-message>
                </template>
              </div>
              <div class="chatFooter">
                <textarea id="chatMsg" ref="textArea" autofocus v-on:keyup="handleUserMessage" placeholder="Type your message. Press shift + Enter to send" />
              </div>
            </div>`,
  props: ['connected','messages','messagessofar'],
  methods: {
    handleUserMessage: function(event) {
      // When shift and enter key is pressed
      if (event.shiftKey && event.keyCode === 13) {
        // call the sendmessages of ChatContainer throught the props
        sendMessageEnd();

        // Prevent default and clear the textarea
        event.preventDefault();
        this.$refs.textArea.value = null;
      }else{
        var msg = this.$refs.textArea.value.trim();
        if (msg !== '') {
          // call the sendmessages of ChatContainer throught the props
          sendMessage(msg);
        }
      }

    },
    handleJoinName: function(event) {
      var name = this.$refs.joinName.value.trim();
      if(name.length > 0){
        this.$refs.joinButton.disabled = false;
        if (event.keyCode === 13) {
          this.handleJoinButton();
        }
      }else{
        this.$refs.joinButton.disabled = true;
      }
    },
    handleJoinButton: function() {
      var name = this.$refs.joinName.value.trim();
      if (name !== '') {
        joinChat(name);
      }
      this.$refs.joinName.value = null;
    },
    handleHideChat: function() {
      hideChat();
    }
  }
})

const sharedState = {}

var app = new Vue({
  el: '#chatWindow',
  data:  {
      state: sharedState,
      ui: {},
      connected:false,
      username: 'Unknown',
      messages: [],
      messagessofar: {}
  }
});

app.ui.chatApp = document.getElementById('chatApp');
app.ui.chatLauncher = document.getElementById('chatLauncher');
app.ui.chatWindow = document.getElementById('chatWindow');


const appendMessage = (changes) => {
  app.messages = app.messages.concat(changes);
}
const appendMessageSoFar = (changes) => {
  app.messagessofar = Object.assign({},app.messagessofar, changes);
}
const joinChat = (name) => {
  app.username = name;
  app.socket = io(chatServerURL);
  app.socket.emit('join', {'name':app.username});
  app.socket.on('chat message end', function(data){
    appendMessage([data]);
    delete app.messagessofar[data.id];
  });
  app.socket.on('chat message', function(data){
    appendMessageSoFar({[data.id]:data});
  });
  app.socket.on('join', function(data){
    appendMessage([data]);
  });
  app.socket.on('leave', function(data){
    appendMessage([data]);
  });
  app.connected = true;
}

const showChat = () => {
  addClass(app.ui.chatLauncher,'hide');
  removeClass(app.ui.chatWindow,'hide');
}
const hideChat = () => {
  addClass(app.ui.chatWindow,'hide');
  removeClass(app.ui.chatLauncher,'hide');
}
const sendMessage = (message) => {
  app.socket.emit('chat message', {'msg':message});
}
const sendMessageEnd = () => {
  app.socket.emit('chat message end');
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
