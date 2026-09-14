export const LANGUAGES = [
  'javascript',
  'python',
  'sql',
  'csharp',
] as const;

export type Language = (typeof LANGUAGES)[number];