import { relations } from "drizzle-orm";
import { categories, folders, notes, subfolders } from "./schema";

export const categoriesRelations = relations(categories, ({ many }) => ({
    folders: many(folders),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
    category: one(categories, {
        fields: [folders.categoryId],
        references: [categories.id],
    }),
    subfolders: many(subfolders),
    notes: many(notes),
}));

export const subfoldersRelations = relations(subfolders, ({ one, many }) => ({
    folder: one(folders, {
        fields: [subfolders.folderId],
        references: [folders.id],
    }),
    notes: many(notes),
}));

export const notesRelations = relations(notes, ({ one }) => ({
    folder: one(folders, {
        fields: [notes.folderId],
        references: [folders.id],
    }),
    subfolder: one(subfolders, {
        fields: [notes.subfolderId],
        references: [subfolders.id],
    }),
}));