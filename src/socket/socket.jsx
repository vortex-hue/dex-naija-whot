import { io } from "socket.io-client";

const socket = io("https://dex-naija-whot-backend.onrender.com", {
  transports: ['polling', 'websocket'],
  upgrade: true,
  timeout: 20000,
  forceNew: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;