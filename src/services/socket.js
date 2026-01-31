import { io } from "socket.io-client";

export const socket = io("https://pi-romote-relay.onrender.com", {
  transports: ["websocket"],
  auth: {
    token: "piR3m0t3_9f8a2c4d_token", // same token as relay
  },
});
