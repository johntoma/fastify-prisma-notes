/**
 * Helper function to clean tag lists
 * - Ensure lowercase,
 * - trim whitespaces,
 * - remove duplicates and empty strings if provided
 */
export function cleanTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map((t) => t.toLowerCase().trim()))).filter(
    Boolean
  );
}
