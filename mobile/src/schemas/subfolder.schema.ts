import z from "zod";

export const subfolderSchema = z.object({
  folderId: z
    .string()
    .trim(),

  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name is too long")
});

export type SubfolderFormData = z.infer<typeof subfolderSchema>;