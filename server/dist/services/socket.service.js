"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = initialize;
exports.getIO = getIO;
exports.close = close;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
let io = null;
function initialize(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: env_1.env.corsOrigin,
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
function getIO() {
    if (!io)
        throw new Error("Socket.io not initialized");
    return io;
}
function close() {
    if (io) {
        io.close();
        io = null;
    }
}
//# sourceMappingURL=socket.service.js.map