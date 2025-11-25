import { FastifyInstance } from "fastify";
import { notesRoutes } from "./notes.ts";
import { authorsRoutes } from "./authors.ts";

/**
 * API v1 routes
 * All routes registered here will be prefixed with /api/v1
 */
export async function apiV1Routes(fastify: FastifyInstance) {
  fastify.register(notesRoutes, { prefix: "/notes" });
  fastify.register(authorsRoutes, { prefix: "/authors" });
}
