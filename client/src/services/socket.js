import { io } from "socket.io-client";
import { SOCKET_URL } from "../config";
import { getCurrentUser } from "./auth";

let socket = null;

// =====================================
// Returns a single shared socket connection for the whole app.
// Automatically "identifies" the connection with the logged-in
// user's role + id so the server can put it in the right room(s)
// (see server/utils/socket.js for the room conventions).
// =====================================
export function getSocket() {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  const identify = () => {
    const user = getCurrentUser();
    if (user) {
      const userId = user.id || user._id;
      if (userId && user.role) {
        socket.emit("identify", {
          role: String(user.role).toLowerCase(),
          userId: String(userId),
        });
      }
    }
  };

  socket.on("connect", identify);

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
