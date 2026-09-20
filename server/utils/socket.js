const { Server } = require("socket.io");

let io = null;

// =====================================
// ROOM NAMING CONVENTIONS
// =====================================
// admins                -> everyone on the Admin panel
// restaurant:<userId>   -> a specific restaurant's dashboard
// ngo:<ngoUserId>       -> a specific NGO's dashboard
// ngos                  -> every logged-in NGO (used to broadcast new
//                          donations to the whole NGO pool)
const rooms = {
  admins: () => "admins",
  ngos: () => "ngos",
  restaurant: (userId) => `restaurant:${userId}`,
  ngo: (userId) => `ngo:${userId}`,
};

function initSocket(server, corsOrigin = "*") {
  io = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    // Client tells us who it is right after connecting so we can
    // put it in the right room(s). Payload: { role, userId }
    socket.on("identify", ({ role, userId } = {}) => {
      if (role === "admin") {
        socket.join(rooms.admins());
      }
      if (role === "ngo" && userId) {
        socket.join(rooms.ngo(userId));
        socket.join(rooms.ngos());
      }
      if (role === "donor" && userId) {
        socket.join(rooms.restaurant(userId));
      }
    });

    socket.on("disconnect", () => {
      // no-op, sockets auto-leave their rooms
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    // Real-time layer is optional in dev if the socket server never
    // initialized (e.g. tests) - fail soft instead of crashing requests.
    return {
      to: () => ({ emit: () => {} }),
      emit: () => {},
    };
  }
  return io;
}

module.exports = { initSocket, getIO, rooms };
