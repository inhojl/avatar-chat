const express = require('express');
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const httpServer = http.Server(app);
const io = socketIo(httpServer);
const path = require('path');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}

io.on('connection', (socket) => {
  console.log('connected')

})

const port = process.env.PORT || 5000;
httpServer.listen(port, () => console.log(`Server is running on port ${port}`));