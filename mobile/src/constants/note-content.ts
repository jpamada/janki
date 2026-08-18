export const noteContentTypes = [
    "text",
    "code",
] as const;

export type NoteContentType = (typeof noteContentTypes)[number];