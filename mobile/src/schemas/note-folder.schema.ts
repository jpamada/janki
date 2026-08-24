import z from "zod";

export const noteFolderSchema = z.object({
  id: z
    .string()
    .trim()
    .optional(),
    
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name is too long"),
  
  parentId: z
    .string()
    .trim()
    .optional()
});

export type NoteFolderFormData = z.infer<typeof noteFolderSchema>;