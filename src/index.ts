import "dotenv/config";
import Fastify from "fastify";
import { apiV1Routes } from "./routes/index.ts";

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

fastify.register(apiV1Routes, { prefix: "/api/v1" });

async function main() {
  await fastify.listen({
    port: 3000,
    host: "0.0.0.0",
  });
}

// Graceful shutdown - stop server right before restart.
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    await fastify.close();

    process.exit(0);
  });
});

main();
