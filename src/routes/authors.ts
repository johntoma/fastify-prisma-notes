import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { validate as isValidUUID } from "uuid";
import { prisma } from "../db.ts";

export async function authorsRoutes(fastify: FastifyInstance) {
  // POST /api/v1/authors - Create a new author
  fastify.post("/", {
    handler: async (
      request: FastifyRequest<{
        Body: {
          name: string;
        };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { name } = request.body;

        // Basic validation
        if (!name || name.trim() === "") {
          return reply.code(400).send({
            error: "Bad Request",
            message: "Author name is required",
          });
        }

        // Create the author in the database
        const author = await prisma.author.create({
          data: {
            name: name.trim(),
          },
        });

        // Return 201 Created with the new author
        return reply.code(201).send(author);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          message: "Failed to create author",
        });
      }
    },
  });

  // GET /api/v1/authors - List all authors
  fastify.get("/", {
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const authors = await prisma.author.findMany({
          orderBy: {
            name: "asc",
          },
        });

        return reply.code(200).send(authors);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          message: "Failed to fetch authors",
        });
      }
    },
  });

  // GET /api/v1/authors/:id - Get author by id
  fastify.get("/:id", {
    handler: async (
      request: FastifyRequest<{
        Params: {
          id: string;
        };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;

        // Validate UUID format
        if (!isValidUUID(id)) {
          return reply.code(400).send({
            error: "Bad Request",
            message: "Invalid UUID format",
          });
        }

        const author = await prisma.author.findUnique({
          where: { id },
        });

        if (!author) {
          return reply.code(404).send({
            error: "Not Found",
            message: "Author not found",
          });
        }

        return reply.code(200).send(author);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          message: "Failed to fetch author",
        });
      }
    },
  });
}
