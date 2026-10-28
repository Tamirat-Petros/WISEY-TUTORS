import "dotenv/config";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";
import { logger } from "./http/logger.js";

const server = app.listen(env.PORT, () => logger.info({ port: env.PORT }, "Wisey Tutors API is listening"));
let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info({ signal }, "Graceful shutdown started");
  const forceExit = setTimeout(() => {
    logger.error("Shutdown deadline exceeded");
    process.exit(1);
  }, 10_000).unref();
  server.close(async (error) => {
    clearTimeout(forceExit);
    if (error) logger.error({ err: error }, "HTTP server close failed");
    try { await prisma.$disconnect(); }
    catch (disconnectError) { logger.error({ err: disconnectError }, "Database disconnect failed"); }
    process.exit(error ? 1 : 0);
  });
}

process.on("SIGINT", () => { void shutdown("SIGINT"); });
process.on("SIGTERM", () => { void shutdown("SIGTERM"); });
process.on("unhandledRejection", (error) => {
  logger.fatal({ err: error }, "Unhandled promise rejection");
  void shutdown("unhandledRejection");
});
