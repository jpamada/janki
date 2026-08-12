import { foreignKey, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const folders = sqliteTable("folders", {
    id: text("id").primaryKey(),

    parentId: text("parent_id"),

    name: text("name").notNull(),

    createdAt: integer("created_at", {
        mode: "timestamp_ms"
    }).notNull(),

    updatedAt: integer("updated_at", {
        mode: "timestamp_ms"
    }),

    deletedAt: integer("deleted_at", {
        mode: "timestamp_ms"
    }),

}, (table) => [
    foreignKey({
        columns: [table.parentId],
        foreignColumns: [table.id],
        name: "parent_id_fk",
    }).onDelete("restrict")
]);


export const notes = sqliteTable("notes", {
    id: text("id").primaryKey(),

    folderId: text("folder_id"),

    title: text("title").notNull(),

    content: text("content").notNull().default(""),

    createdAt: integer("created_at", {
        mode: "timestamp_ms"
    }).notNull(),

    updatedAt: integer("updated_at", {
        mode: "timestamp_ms"
    }),

    deletedAt: integer("deleted_at", {
        mode: "timestamp_ms"
    }),

}, (table) => [
    foreignKey({
        columns: [table.folderId],
        foreignColumns: [folders.id],
        name: "folder_id_fk",
    }).onDelete("cascade")
]);