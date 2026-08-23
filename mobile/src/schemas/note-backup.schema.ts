import z from "zod";

const noteContentBackupSchema = z.object({
  id: z.string(),
  noteSectionId: z.string(),

  title: z.string(),
  content: z.string(),
  type: z.string(),

  url: z.string().nullable(),
  remarks: z.string().nullable(),
  position: z.number().nullable(),
});

const noteSectionBackupSchema = z.object({
  id: z.string(),
  noteId: z.string(),

  title: z.string(),
  position: z.number().nullable(),

  noteContents: z.array(noteContentBackupSchema),
});

const noteBackupItemSchema = z.object({
  id: z.string(),
  folderId: z.string().nullable(),

  title: z.string(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  deletedAt: z.coerce.date().nullable(),

  noteSections: z.array(noteSectionBackupSchema),
});

export const noteBackupSchema = z.object({
  version: z.number(),
  type: z.literal("notes"),
  exportedAt: z.string(),

  notes: z.array(noteBackupItemSchema),
});

export type NoteBackupData = z.infer<typeof noteBackupSchema>;