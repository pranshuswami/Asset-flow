import { Server } from "socket.io";
import { env } from "../config/env";

let io: Server | null = null;

export function initialize(server: any) {
  io = new Server(server, {
    cors: {
      origin: env.corsOrigin,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

export function close() {
  if (io) {
    io.close();
    io = null;
  }
}
