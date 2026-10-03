export const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'php',
  'java',
  'csharp',
  'sql',
  'html',
  'css',
  'json',
] as const;

export type Language = (typeof LANGUAGES)[number];