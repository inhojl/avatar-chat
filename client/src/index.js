import { io } from 'socket.io-client';
import World from './world';


document.addEventListener('DOMContentLoaded', () => {
  const socket = io.connect('/');
  if (socket) {
    console.log(socket)
  }

  const world = new World();
});