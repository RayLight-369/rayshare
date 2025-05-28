import { io } from "socket.io-client";

export const socket = io( 'https://rayshare-server.onrender.com', {
  autoConnect: false
} );
