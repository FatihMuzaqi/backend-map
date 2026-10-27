import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
  const userId = socket.handshake.auth?.userId 
              || socket.handshake.query?.userId;

  console.log("🟢 User connect:", userId);

  if (userId) {
    socket.join("user_" + userId);
  } else {
    console.log("❌ userId tidak ada!");
  }

  socket.on("disconnect", () => {
    console.log("🔴 User disconnect:", userId);
  });
});

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket belum diinisialisasi!");
  }
  return io;
};