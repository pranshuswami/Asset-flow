import { createApp } from "./config/app";
import { env } from "./config/env";
<<<<<<< HEAD
import { socketService } from "./services/socket.service";
=======
import { initialize, close } from "./services/socket.service";
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[server] AssetFlow AI backend running on port ${env.port} (${env.nodeEnv})`);
});

<<<<<<< HEAD
socketService.initialize(server);
=======
initialize(server);
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec

process.on("SIGINT", async () => {
  console.log("[server] Shutting down gracefully...");
  server.close(async () => {
<<<<<<< HEAD
    await socketService.close();
=======
    await close();
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
    process.exit(0);
  });
});
