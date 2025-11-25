import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../db.ts";
import { validate as isValidUUID } from "uuid";
import { cleanTags } from "../utils/tags.ts";
type NoteUpdateData = {
  title?: string;
  content?: string | null;
  tags?: {
    set: [];
    connectOrCreate: Array<{
      where: { name: string };
      create: { name: string };
    }>;
  };
};
type PatchNoteBody = {
  title?: string;
  content?: string;
  tags?: string[];
};
export async function notesRoutes(fastify: FastifyInstance) {
  // POST /api/v1/notes - Create a new note
  fastify.post("/", {
    handler: async (
      request: FastifyRequest<{
        Body: {
          title: string;
          content?: string;
          authorId: string;
          tags: string[];
        };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { title, content, authorId, tags = [] } = request.body;

        // Validation
        if (!title || title.trim() === "") {
          return reply.code(400).send({
            error: "Bad Request",
            message: "Note title is required",
          });
        }

        if (tags !== undefined && !Array.isArray(tags)) {
          return reply.code(400).send({
            error: "Bad Request",
            message: "Tags must be an array",
          });
        }

        if (!authorId || authorId.trim() === "") {
          return reply.code(400).send({
            error: "Bad Request",
            message: "authorId is required",
          });
        }

        // Validate authorId UUID format
        if (!isValidUUID(authorId)) {
          return reply.code(400).send({
            error: "Bad Request",
            message: "The provided authorId is not in valid UUID format",
          });
        }

        // Verify author exists
        const author = await prisma.author.findUnique({
          where: { id: authorId },
        });

        if (!author) {
          return reply.code(404).send({
            error: "Not Found",
            message: "Author not found",
          });
        }

        // Create the note with tags
        // Prisma's `connectOrCreate` will handle existing vs new tags automatically.
        // In other words, if a tag doesnt exist, it will be created.
        const cleanedTags = cleanTags(tags);
        const note = await prisma.note.create({
          data: {
            title: title.trim(),
            content: content?.trim() || null, // content is an optional field since I chose to support "title only" notes.
            authorId,
            tags: {
              connectOrCreate: cleanedTags.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          },
          include: {
            author: true,
            tags: true,
          },
        });

        // Return 201 Created with the new note
        return reply.code(201).send(note);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          message: "Failed to create note",
        });
      }
    },
  });

  // GET /api/v1/notes - List all notes
  fastify.get("/", {
    handler: async (
      request: FastifyRequest<{
        Querystring: {
          tags?: string; // Optional str representing list of tags to filter by, separated by commas.
        };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { tags } = request.query;

        // Build filter condition...
        // If no tags are provided, all notes will be returned.
        const where = tags
          ? {
              tags: {
                // Essentially, "some" means "give me notes that have *at least one* of these tags"
                some: {
                  name: {
                    in: tags.split(",").map((tag) => tag.toLowerCase().trim()), // split tags by comma
                  },
                },
              },
            }
          : {};

        const notes = await prisma.note.findMany({
          where,
          include: {
            author: true,
            tags: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return reply.code(200).send(notes);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          message: "Failed to fetch notes",
        });
      }
    },
  });

  // GET /api/v1/notes/:id - Get a single note by ID
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

        const note = await prisma.note.findUnique({
          where: { id },
          include: {
            author: true,
            tags: true,
          },
        });

        if (!note) {
          return reply.code(404).send({
            error: "Not Found",
            message: "Note not found",
          });
        }

        return reply.code(200).send(note);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          message: "Failed to fetch note",
        });
      }
    },
  });

  // PATCH /api/v1/notes:id - Update a note
  fastify.patch("/:id", {
    handler: async (
      request: FastifyRequest<{
        Params: {
          id: string;
        };
        Body: PatchNoteBody;
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

        // Validate request body
        validateNotePatchRequest(request.body);

        // Build update data
        const data = buildNoteUpdateData(request.body);

        const updatedNote = await prisma.note.update({
          where: { id },
          data,
          include: {
            author: true,
            tags: true,
          },
        });

        return reply.code(200).send(updatedNote);
      } catch (error) {
        fastify.log.error(error);

        // Handle validation errors
        if (error instanceof Error) {
          const validationErrors = [
            "No fields to update provided",
            "Title cannot be empty",
            "Tags must be an array",
          ];

          if (validationErrors.some((msg) => error.message.includes(msg))) {
            return reply.code(400).send({
              error: "Bad Request",
              message: error.message,
            });
          }
        }

        // Handle Prisma "not found" error
        if ((error as any).code === "P2025") {
          return reply.code(404).send({
            error: "Not Found",
            message: "Note not found",
          });
        }

        return reply.code(500).send({
          error: "Internal Server Error",
          message: "Failed to update note",
        });
      }
    },
  });
}

function validateNotePatchRequest(body: PatchNoteBody): void {
  if (!Object.keys(body).length) {
    throw new Error("No fields to update provided");
  }

  if (body.title !== undefined && (!body.title || body.title.trim() === "")) {
    throw new Error("Title cannot be empty");
  }

  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    throw new Error("Tags must be an array");
  }
}

function buildNoteUpdateData(body: PatchNoteBody): NoteUpdateData {
  const data: NoteUpdateData = {};

  if (body.title !== undefined) data.title = body.title.trim();

  if (body.content !== undefined) data.content = body.content.trim() || null;

  if (body.tags !== undefined) {
    const cleanedTags = cleanTags(body.tags);
    data.tags = {
      set: [],
      connectOrCreate: cleanedTags.map((name) => ({
        where: { name },
        create: { name },
      })),
    };
  }

  return data;
}
