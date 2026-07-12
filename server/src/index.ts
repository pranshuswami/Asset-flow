import { createApp } from "./config/app";
import { env } from "./config/env";
import { initialize, close } from "./services/socket.service";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[server] AssetFlow AI backend running on port ${env.port} (${env.nodeEnv})`);
});

initialize(server);

process.on("SIGINT", async () => {
  console.log("[server] Shutting down gracefully...");
  server.close(async () => {
    await close();
    process.exit(0);
  });
});
