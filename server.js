const express = require('express');
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const httpServer = http.Server(app);
const io = socketIo(httpServer);
const path = require('path');
const { userInfo } = require('os');



class ConnectedUser {
  constructor(socket) {
    this.id = socket.id;
    this.pos = [Math.random() * 20, 0, Math.random() * 20];
    this.state = 'idle';
    this.socket = socket;
    this.rotation = [0,0,0,0];
    this.socket.emit('receive starting position', this.pos)

    this.socket.on('pos', data => {
      const [ pos, state, rotation ] = data;
      this.pos = pos;
      this.state = state;
      this.rotation = rotation;
      this.broadcast()
    });

    this.broadcast();
  }
  
  broadcast() {
    for (let i = 0; i < USERS.length; i++) {
      if (USERS[i].id === this.id) continue;
      USERS[i].socket.emit('pos', [ 
        this.id, 
        this.pos, 
        this.state,
        this.rotation 
      ]);
      this.socket.emit('pos', [ 
        USERS[i].id, 
        USERS[i].pos, 
        USERS[i].state,
        USERS[i].rotation
      ]);
    }
  }
}

const USERS = [];


if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}

io.on('connection', (socket) => {
  console.log('user connected')
  USERS.push(new ConnectedUser(socket));

})

const port = process.env.PORT || 5000;
httpServer.listen(port, () => console.log(`Server is running on port ${port}`));