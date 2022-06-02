let io;

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: "*",
        methods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: [
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization",
        ],
        credentials: true,
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
