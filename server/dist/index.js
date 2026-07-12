"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./config/app");
const env_1 = require("./config/env");
const socket_service_1 = require("./services/socket.service");
const app = (0, app_1.createApp)();
const server = app.listen(env_1.env.port, () => {
    console.log(`[server] AssetFlow AI backend running on port ${env_1.env.port} (${env_1.env.nodeEnv})`);
});
(0, socket_service_1.initialize)(server);
process.on("SIGINT", async () => {
    console.log("[server] Shutting down gracefully...");
    server.close(async () => {
        await (0, socket_service_1.close)();
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map