# Note-Taking API

A RESTful API for managing notes with tag-based filtering, built with Fastify and Prisma.

## 🚀 Live Demo
I've deployed the api to railway. Try it out using the link below:

**Live API URL:** [https://fastify-prisma-notes-production.up.railway.app](https://fastify-prisma-notes-production.up.railway.app)

**Try it now:**
```bash
# List all notes
curl https://fastify-prisma-notes-production.up.railway.app/api/v1/notes

# List all authors
curl https://fastify-prisma-notes-production.up.railway.app/api/v1/authors
```

**Base API endpoint:** `https://fastify-prisma-notes-production.up.railway.app/api/v1`

## Tech Stack

- **Framework**: Fastify 5.6.2 (TypeScript)
- **Database**: PostgreSQL with Prisma ORM 7.0.0
- **Runtime**: Node.js with tsx for TypeScript execution
- **Validation**: UUID validation for resource identifiers
- **Deployment**: Railway (with managed PostgreSQL)

## Features

- Create, read, and update notes
- Tag-based filtering for notes
- Author management
- Input validation and comprehensive error handling
- Proper HTTP status codes (200, 201, 400, 404, 500)
- Many-to-many relationship between notes and tags
- Automated integration tests with Vitest

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- PostgreSQL (use Docker for quick setup, or Railway for cloud database)

## Setup Instructions

### Option 1: Local Development with Docker (Recommended)

#### 1. Clone the repository

```bash
git clone <repository-url>
cd fastify-prisma-notes
```

#### 2. Start PostgreSQL with Docker

```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

This creates a PostgreSQL container running on `localhost:5432`

#### 3. Install dependencies

```bash
npm install
```

#### 4. Set up environment variables

The `.env` file is already configured for local Docker PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fastify_prisma_notes?schema=public"
```

#### 5. Run database migrations

```bash
npx prisma migrate dev
```

#### 6. Generate Prisma Client

```bash
npx prisma generate
```

Or simply run the build script which generates the Prisma client:

```bash
npm run build
```

#### 7. Start the server

```bash
npm start
```

The server will start on `http://localhost:3000`

For development with hot-reload:

```bash
npm run dev
```

#### 8. Run tests (optional)

Verify your setup by running the test suite:

```bash
npm test
```

All 8 integration tests should pass, covering:
- Creating and listing authors
- Creating, reading, updating notes
- Tag-based filtering

**Note:** Stop the development server before running tests, as they both use the same database.

## API Documentation

Base URL: `http://localhost:3000/api/v1`

It wasnt clear if "Author" is meant to be treated as a *real* entity, or if its meant to be a free text field indicating "who wrote this note". I assume it was the latter, but I decided to just treat it as a real entity as this is probably what should be done if this was a production system.


**Important:** You must create an author first before creating notes, as every note requires a valid `authorId`.

**Note for Windows Users:** The curl examples below use bash syntax with backslashes (`\`) for line continuation. If you're using PowerShell, either:
1. Use Git Bash or WSL to run these commands as-is
2. Remove the backslashes and put everything on one line
3. See the [Windows PowerShell Examples](#windows-powershell-examples) section below for PowerShell-specific syntax

### Authors Endpoints

#### Create an Author

```bash
curl -X POST http://localhost:3000/api/v1/authors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe"
  }'
```

**Response (201 Created):**
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe"
}
```

#### List All Authors

```bash
curl http://localhost:3000/api/v1/authors
```

#### Get a Single Author

```bash
curl http://localhost:3000/api/v1/authors/<author-uuid>
```

### Notes Endpoints

#### Create a Note

Ensure you copy over the UUID of the author you just created.

```bash
curl -X POST http://localhost:3000/api/v1/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Note",
    "content": "This is the content of my note",
    "authorId": "<author-uuid>",
    "tags": ["javascript", "tutorial"]
  }'
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "My First Note",
  "content": "This is the content of my note",
  "authorId": "650e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-11-20T10:30:00.000Z",
  "updatedAt": "2024-11-20T10:30:00.000Z",
  "author": {
    "id": "650e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe"
  },
  "tags": [
    { "id": "...", "name": "javascript" },
    { "id": "...", "name": "tutorial" }
  ]
}
```

#### List All Notes

```bash
curl http://localhost:3000/api/v1/notes
```

#### Filter Notes by Tags

```bash
# Filter by one tag
curl http://localhost:3000/api/v1/notes?tags=javascript

# Filter by multiple tags (returns notes with ANY of these tags)
curl http://localhost:3000/api/v1/notes?tags=javascript,typescript
```

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My First Note",
    "content": "This is the content of my note",
    "authorId": "650e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-11-20T10:30:00.000Z",
    "updatedAt": "2024-11-20T10:30:00.000Z",
    "author": { "id": "...", "name": "John Doe" },
    "tags": [...]
  }
]
```

#### Get a Single Note

```bash
curl http://localhost:3000/api/v1/notes/<note-uuid>
```

**Response (200 OK):**
Same format as create note response.

#### Update a Note

```bash
curl -X PATCH http://localhost:3000/api/v1/notes/<note-uuid> \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content",
    "tags": ["updated", "modified"]
  }'
```

**Note**: 
- All fields are optional in update requests. Only provided fields will be updated.
- If updating tags, the existing tags will be replaced by the provided tags array. If you need to simply "add" a tag, you need to include the existing tags as well as the new tag, otherwise they will be cleared.


**Response (200 OK):**
Returns the updated note object.

### Complete Workflow Example

Here's a complete workflow to create an author, create a note, and filter notes:

**Note:** This example uses bash syntax. Windows users should use Git Bash, WSL, or manually copy/paste the IDs between commands.

```bash
# 1. Create an author
AUTHOR_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith"}')

AUTHOR_ID=$(echo $AUTHOR_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

# 2. Create a note
curl -X POST http://localhost:3000/api/v1/notes \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Learning Fastify\",
    \"content\": \"Fastify is a fast and efficient web framework\",
    \"authorId\": \"$AUTHOR_ID\",
    \"tags\": [\"fastify\", \"nodejs\", \"tutorial\"]
  }"

# 3. List all notes
curl http://localhost:3000/api/v1/notes

# 4. Filter notes by tag
curl http://localhost:3000/api/v1/notes?tags=fastify
```

## Error Responses

The API returns consistent error responses:

**400 Bad Request:**
```json
{
  "error": "Bad Request",
  "message": "Note title is required"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Note not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to create note"
}
```

## Windows PowerShell Examples

If you're using Windows PowerShell, use these commands instead:

### Create an Author (PowerShell)

```powershell
curl.exe -X POST http://localhost:3000/api/v1/authors -H "Content-Type: application/json" -d '{\"name\": \"John Doe\"}'
```

### List All Authors (PowerShell)

```powershell
curl.exe http://localhost:3000/api/v1/authors
```

### Create a Note (PowerShell)

```powershell
curl.exe -X POST http://localhost:3000/api/v1/notes -H "Content-Type: application/json" -d '{\"title\": \"My First Note\", \"content\": \"This is the content\", \"authorId\": \"<author-uuid>\", \"tags\": [\"javascript\", \"tutorial\"]}'
```

### List All Notes (PowerShell)

```powershell
curl.exe http://localhost:3000/api/v1/notes
```

### Filter Notes by Tags (PowerShell)

```powershell
curl.exe "http://localhost:3000/api/v1/notes?tags=javascript"
```

### Update a Note (PowerShell)

```powershell
curl.exe -X PATCH http://localhost:3000/api/v1/notes/<note-uuid> -H "Content-Type: application/json" -d '{\"title\": \"Updated Title\", \"content\": \"Updated content\", \"tags\": [\"updated\"]}'
```

**Note:** Use `curl.exe` instead of `curl` to ensure you're using the real curl executable, not PowerShell's `Invoke-WebRequest` alias. All quotes inside the JSON must be escaped with backslashes (`\"`).

## Quick Test with Live API

Want to test the deployed API right now? Here's a complete workflow:

```bash
# 1. Create an author
curl -X POST https://fastify-prisma-notes-production.up.railway.app/api/v1/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User"}'

# Copy the "id" from the response, then create a note (replace <author-id> with the actual ID)
curl -X POST https://fastify-prisma-notes-production.up.railway.app/api/v1/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Testing the API", "content": "This API is live on Railway!", "authorId": "<author-id>", "tags": ["test", "railway"]}'

# List all notes
curl https://fastify-prisma-notes-production.up.railway.app/api/v1/notes

# Filter by tag
curl "https://fastify-prisma-notes-production.up.railway.app/api/v1/notes?tags=railway"
```

## Design Decisions & Assumptions

### Data Model

**Separate Tags Table:**
I chose to implement tags as a separate table with a many-to-many relationship rather than storing them as comma-separated strings. 
Benefits:
- Eliminates duplicate tag storage (each tag is defined once)
- Efficient filtering using database joins instead of string operations
- Ability to query all available tags across the system
- Better data integrity and normalization

There is no way to actually "delete" tags. The only way to create a new tag is create a Note and include the tag you want to create in the request body. If it does not already exist, it will automatically be created.

**Optional Content Field:**
I decided that notes can have a title without content to support "title-only" quick notes.

**UUID Identifiers:**
Using UUIDs instead of auto-incrementing integers for:
- Better scalability in distributed systems
- No sequential ID enumeration vulnerability
- Globally unique identifiers
- In a production system, UUIDs make it impossible to guess how many notes are in the database.

### Database Choice

**PostgreSQL:**
- Production-ready database used in deployment
- Better for demonstrating real-world application architecture
- Supported natively by cloud platforms (Railway, Render, Vercel)
- Easy local setup with Docker

**No Indexes (for assessment scope):**
With small datasets (<100 rows), full table scans are faster than index lookups. For production with larger datasets, I would add:
- `@@index([createdAt])` - for date-sorted queries
- `@@index([authorId, createdAt])` - compound index for author's notes by date

### Technology Choices

**Prisma 7.0.0:**
I decided to go with Prisma, then quickly realised Prisma 7 was released only a few days before starting the project. I decided to go with it, hopefully to demonstrate how I can quickly adapt to new releases.

Using the latest Prisma version (released Nov 19, 2024) with:
- TypeScript-based client (no Rust engine)
- ~90% smaller bundle size
- Up to 3x faster queries
- Required changes: separate `prisma.config.ts`, explicit driver adapters

**Fastify over Express:**
I didnt have any Fastify experience prior to this project. I decided to go with it because of it appeared to be easy to learn and quick to set up, and also because I wanted a bit of a challenge.
- 20-30% faster than Express
- Built-in TypeScript support
- Modern async/await architecture
- Extensive plugin ecosystem

### Validation Strategy

Input validation on all endpoints:
- Required field checks
- UUID format validation
- Type validation (arrays, strings)
- Empty string rejection
- Author existence verification before note creation

### Tag Handling

Tags are case-insensitive and automatically:
- Converted to lowercase
- Trimmed of whitespace
- Deduplicated
- Created if they don't exist (using Prisma's `connectOrCreate`)

### Bonus Features Implemented

- ✅ **Deployed to Railway** - Live production environment with PostgreSQL
- ✅ **Automated integration tests** - 8 tests covering all endpoints with Vitest
- ✅ **Comprehensive input validation** - UUID, required fields, type checking
- ✅ **Proper error handling** - Try-catch blocks with descriptive error messages
- ✅ **Correct HTTP status codes** - 200, 201, 400, 404, 500 used appropriately
- ✅ **Additional features** - Author management endpoints, tag normalization, graceful shutdown

## Project Structure

```
fastify-prisma-notes/
├── prisma/
│   ├── migrations/         # Database migrations
│   └── schema.prisma       # Data model definition
├── src/
│   ├── generated/prisma/   # Generated Prisma client
│   ├── routes/             # API route handlers
│   │   ├── index.ts        # Route registration
│   │   ├── notes.ts        # Note endpoints
│   │   └── authors.ts      # Author endpoints
│   ├── utils/              # Utility functions
│   │   └── tags.ts         # Tag cleaning/normalization
│   ├── db.ts               # Prisma client singleton
│   └── index.ts            # Server entry point
├── tests/
│   └── tests.test.ts       # Integration tests
├── .env                    # Environment variables
├── .env.example            # Example environment variables
├── prisma.config.ts        # Prisma 7 configuration
├── vitest.config.ts        # Vitest configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Deploying to Railway

Railway provides free PostgreSQL hosting perfect for this project. Here is how I deployed the project to railway:

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the Node.js app

### 3. Add PostgreSQL Database

1. In the Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway automatically sets `DATABASE_URL` environment variable

### 4. Configure Build Command

Railway should auto-detect, but verify these settings:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 5. Deploy!

Railway will:
1. Install dependencies
2. Run `npm run build` (generates Prisma client + runs migrations)
3. Start the server with `npm start`

The API will be live at: `https://your-app.up.railway.app`

## Troubleshooting

**"PrismaClient is not configured" error:**
```bash
npx prisma generate
```

**PostgreSQL connection error:**
- Make sure Docker container is running: `docker ps`
- Restart container: `docker restart postgres`
- Check connection string in `.env` matches your PostgreSQL setup

**Port 3000 already in use:**
Change the port in `src/index.ts` or kill the process using port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Migration errors:**
If you have issues with migrations, you can reset the database:
```bash
# WARNING: This deletes all data
npx prisma migrate reset
```

## Testing

The project includes integration tests built with Vitest that cover all API endpoints:

### Running Tests

```bash
npm test
```

### Test Coverage

The test suite includes 8 tests covering:

**Author Endpoints:**
- ✅ POST /api/v1/authors - Create author
- ✅ GET /api/v1/authors - List all authors
- ✅ GET /api/v1/authors/:id - Get single author

**Note Endpoints:**
- ✅ POST /api/v1/notes - Create note
- ✅ GET /api/v1/notes - List all notes
- ✅ GET /api/v1/notes/:id - Get single note
- ✅ PATCH /api/v1/notes/:id - Update note
- ✅ GET /api/v1/notes?tags=... - Filter notes by tags

### Test Strategy

- **Integration tests** using Fastify's `inject()` method for simulated HTTP requests
- **Shared state** across tests (author ID from creation is used in note tests)
- **Sequential execution** to maintain test dependencies
- **Environment variables** loaded via dotenv for database connection
- **No mocking** - tests run against real database for end-to-end validation

### Test Implementation Details

The tests demonstrate:
- Proper status code validation (201, 200, 400, 404, 500)
- Response structure verification
- Relationship data inclusion (author, tags)
- Tag filtering functionality
- UUID validation

**Important:** Stop the development server before running tests, as both use the same database instance.

## Development

The codebase uses:
- TypeScript with strict type checking
- tsx for running TypeScript without compilation
- Pino for structured logging (with pretty-print in development)
	- This should not be used in a production environment, but its nice to have for this project
- Graceful shutdown handling for SIGINT and SIGTERM
- Vitest for integration testing

## Future Enhancements

Potential improvements for a production system:
- Delete endpoints for notes, tags and authors
- Full CRUD endpoints for tags (currently, there are no endpoints for tags)
- Pagination for list endpoints
- Full-text search for note content
- Rate limiting
- Authentication/authorization
- Database indexes for performance
- Docker containerization
- Separate test database configuration
