import { createApp } from "./config/app";
import { env } from "./config/env";
import { socketService } from "./services/socket.service";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[server] AssetFlow AI backend running on port ${env.port} (${env.nodeEnv})`);
});

socketService.initialize(server);

process.on("SIGINT", async () => {
  console.log("[server] Shutting down gracefully...");
  server.close(async () => {
    await socketService.close();
    process.exit(0);
  });
});
