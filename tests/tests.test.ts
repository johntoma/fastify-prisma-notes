import 'dotenv/config'; // Load environment variables (DATABASE_URL) before anything else
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { apiV1Routes } from '../src/routes/index';

/**
 * Integration Tests for Note-Taking API
 *
 * These tests make real HTTP requests to the Fastify server
 * and verify responses match expected behavior.
 *
 * Test Flow:
 * 1. Create an author (save ID for later tests)
 * 2. List authors
 * 3. Get single author
 * 4. Create a note (using author ID)
 * 5. List notes
 * 6. Get single note
 * 7. Update note
 * 8. Filter notes by tags
 */

// Shared state across tests
let app: FastifyInstance;
let authorId: string;
let noteId: string;

// Setup: Start server before all tests
beforeAll(async () => {
  // Create a Fastify instance (same as in src/index.ts)
  app = Fastify({
    logger: false, // Disable logging during tests to keep output clean
  });

  // Register routes
  app.register(apiV1Routes, { prefix: '/api/v1' });

  // Start the server
  await app.ready();
});

// Cleanup: Close server after all tests
afterAll(async () => {
  await app.close();
});

describe('Authors API', () => {
  test('POST /api/v1/authors - creates a new author', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/authors',
      payload: {
        name: 'Test Author',
      },
    });

    // Verify response
    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name', 'Test Author');

    // Save author ID for later tests
    authorId = body.id;
  });

  test('GET /api/v1/authors - lists all authors', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/authors',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    // Verify our created author is in the list
    const author = body.find((a: any) => a.id === authorId);
    expect(author).toBeDefined();
    expect(author.name).toBe('Test Author');
  });

  test('GET /api/v1/authors/:id - gets a single author', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/authors/${authorId}`,
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.id).toBe(authorId);
    expect(body.name).toBe('Test Author');
  });
});

describe('Notes API', () => {
  test('POST /api/v1/notes - creates a new note', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/notes',
      payload: {
        title: 'Test Note',
        content: 'This is a test note content',
        authorId: authorId, // Using the author ID from earlier test
        tags: ['testing', 'vitest', 'fastify'],
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body).toHaveProperty('id');
    expect(body.title).toBe('Test Note');
    expect(body.content).toBe('This is a test note content');
    expect(body.authorId).toBe(authorId);

    // Verify tags were created
    expect(body.tags).toBeDefined();
    expect(Array.isArray(body.tags)).toBe(true);
    expect(body.tags.length).toBe(3);

    // Verify author relationship is included
    expect(body.author).toBeDefined();
    expect(body.author.name).toBe('Test Author');

    // Save note ID for later tests
    noteId = body.id;
  });

  test('GET /api/v1/notes - lists all notes', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/notes',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    // Verify our created note is in the list
    const note = body.find((n: any) => n.id === noteId);
    expect(note).toBeDefined();
    expect(note.title).toBe('Test Note');
  });

  test('GET /api/v1/notes/:id - gets a single note', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/notes/${noteId}`,
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.id).toBe(noteId);
    expect(body.title).toBe('Test Note');
    expect(body.content).toBe('This is a test note content');

    // Verify relationships are included
    expect(body.author).toBeDefined();
    expect(body.tags).toBeDefined();
  });

  test('PATCH /api/v1/notes/:id - updates a note', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/notes/${noteId}`,
      payload: {
        title: 'Updated Test Note',
        content: 'This content has been updated',
        tags: ['updated', 'testing'], // Changed tags
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.id).toBe(noteId);
    expect(body.title).toBe('Updated Test Note');
    expect(body.content).toBe('This content has been updated');

    // Verify tags were updated (old tags replaced with new ones)
    expect(body.tags.length).toBe(2);
    const tagNames = body.tags.map((t: any) => t.name);
    expect(tagNames).toContain('updated');
    expect(tagNames).toContain('testing');
  });

  test('GET /api/v1/notes?tags=testing - filters notes by tags', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/notes?tags=testing',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(Array.isArray(body)).toBe(true);

    // Verify all returned notes have the 'testing' tag
    body.forEach((note: any) => {
      const tagNames = note.tags.map((t: any) => t.name);
      expect(tagNames).toContain('testing');
    });
  });
});
