// Singleton Socket.IO client for the server-side Digital Twin (server/simulator/engine.js).
//
// Only ever created when USE_BACKEND is on — in standalone mode the app
// never touches the network, so there's nothing to connect or clean up.
// One shared socket for the whole app (not one per page) means switching
// tabs doesn't reconnect, and every page sees the exact same live tick.

import { io } from "socket.io-client";
import { USE_BACKEND } from "./api.js";

// Vite proxies /api to the backend in dev (see vite.config.js), but
// socket.io needs a real origin, not a path — same host:port the API
// proxy targets, overridable for a deployed backend.
const SOCKET_URL = import.meta.env?.VITE_SOCKET_URL || "http://localhost:4000";

let socket = null;

export function getSocket() {
  if (!USE_BACKEND) return null;
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 800,
      reconnectionDelayMax: 4000,
      timeout: 6000,
    });
  }
  return socket;
}
