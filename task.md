# FS Engineer Take-Home Assessment

## Overview
Build a RESTful API for a note-taking application that supports basic CRUD operations and filtering capabilities.

## Requirements

### Core Functionality
Your API must support the following operations:

1. **Create a note** - Add a new note to the system
2. **List notes** - Retrieve all notes (optional filtering by tags)
3. **Get a single note** - Retrieve a specific note by its identifier
4. **Update a note** - Modify an existing note

### Data Model
You have flexibility in designing your note structure, but it must include:
- **Author** (required) - Every note must have an associated author
- **Tags** (required for filtering) - Users must be able to filter notes by one or more tags
- Any other fields you deem appropriate

### Technical Requirements

**Freedom of Choice:**
- Use any programming language and framework you're comfortable with
- Choose your preferred database (SQL, NoSQL, FS, in-memory, etc.)
- Structure your application architecture as you see fit

**Must-haves:**
- The API should be interactable via `curl` commands
- Include a README with:
  - Setup instructions
  - How to run the server locally
  - Example `curl` commands for each endpoint
  - Any assumptions or design decisions you made

**Bonus Points:**
- Deploy the API to a hosting platform
- Include automated tests
- Add input validation and error handling
- Implement proper HTTP status codes

## Evaluation Criteria

This test will help us understand your level of experience, attention to details and engineering practices you employ.

## Submission

Please provide:
1. A Git repository (GitHub, GitLab, etc.) with your code
2. A README with setup and usage instructions
3. If deployed, include the hosted URL

## Time Expectation

This assessment should take approximately **3-4 hours** to complete. We value your time and don't expect a production-ready system. Focus on demonstrating your approach to problem-solving and code quality. Don't go over the 4 hours mark we are not assessing your velocity as long as you submit a working prototype that we can test and review. Even if you haven't implemented all the endpoints.


## Questions?

If you have any questions about the requirements, please don't hesitate to reach out.