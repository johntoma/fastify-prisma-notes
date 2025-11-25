import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Tests run serially by default in vitest 3.x
    // This is important because our tests share state (authorId, noteId)
    // between test cases to simulate a realistic workflow
  },
});
