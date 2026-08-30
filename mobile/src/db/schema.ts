import { foreignKey, index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
    id: text("id").primaryKey(),

    name: text("name").notNull(),
});

export const folders = sqliteTable("folders", {
    id: text("id").primaryKey(),

    categoryId: text("category_id"),

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
        columns: [table.categoryId],
        foreignColumns: [categories.id],
        name: "folders_category_id_fk"
    }).onDelete("set null"),

    index("folders_category_id_idx").on(
        table.categoryId
    ),
]);

export const subfolders = sqliteTable("subfolders", {
    id: text("id").primaryKey(),

    folderId: text("folder_id").notNull(),

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
        columns: [table.folderId],
        foreignColumns: [folders.id],
        name: "subfolders_folder_id_fk",
    }).onDelete("restrict"),

    index("subfolders_folder_id_idx").on(
        table.folderId
    ),
]);

export const notes = sqliteTable("notes", {
    id: text("id").primaryKey(),

    folderId: text("folder_id"),

    subfolderId: text("subfolder_id"),

    title: text("title").notNull(),

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
        name: "notes_folder_id_fk",
    }).onDelete("cascade"),

    foreignKey({
        columns: [table.subfolderId],
        foreignColumns: [subfolders.id],
        name: "notes_subfolder_id_fk",
    }).onDelete("cascade"),

    index("notes_folder_id_idx").on(
        table.folderId
    ),

    index("notes_subfolder_id_idx").on(
        table.subfolderId
    ),
]);

export const noteSections = sqliteTable("note_sections", {
    id: text("id").primaryKey(),

    noteId: text("note_id").notNull(),

    title: text("title").notNull(),

    position: integer("position"),

}, (table) => [
    foreignKey({
        columns: [table.noteId],
        foreignColumns: [notes.id],
        name: "note_sections_note_id_fk"
    }).onDelete("cascade"),

    index("note_sections_note_id_idx").on(
        table.noteId
    ),
]);

export const noteContents = sqliteTable("note_contents", {
    id: text("id").primaryKey(),

    noteSectionId: text("note_section_id").notNull(),

    title: text("title").notNull(),

    content: text("content").notNull(),

    type: text("type").notNull(),

    url: text("url"),

    remarks: text("remarks"),

    position: integer("position"),

}, (table) => [
    foreignKey({
        columns: [table.noteSectionId],
        foreignColumns: [noteSections.id],
        name: "note_contents_note_section_id_fk"
    }).onDelete("cascade"),

    index("note_contents_note_section_id_idx").on(
        table.noteSectionId
    ),
]);

export const subjects = sqliteTable("subjects", {
    id: text("id").primaryKey(),

    title: text("title").notNull(),

    categoryId: text("category_id"),

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
        columns: [table.categoryId],
        foreignColumns: [categories.id],
        name: "subjects_category_id_fk"
    }).onDelete("set null"),

    index("subjects_category_id_idx").on(
        table.categoryId
    ),
]);

export const lessons = sqliteTable("lessons", {
    id: text("id").primaryKey(),

    subjectId: text("subject_id").notNull(),

    title: text("title").notNull(),

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
        columns: [table.subjectId],
        foreignColumns: [subjects.id],
        name: "lessons_subject_id_fk",
    }).onDelete("restrict"),

    index("lessons_subject_id_idx").on(
        table.subjectId
    )
]);

export const questions = sqliteTable("questions", {
    id: text("id").primaryKey(),

    lessonId: text("lesson_id").notNull(),

    question: text("question").notNull(),

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
        columns: [table.lessonId],
        foreignColumns: [lessons.id],
        name: "quesions_lesson_id_fk",
    }).onDelete("restrict"),

    index("questions_lesson_id_idx").on(
        table.lessonId
    )
]);

export const answers = sqliteTable("answers", {
    id: text("id").primaryKey(),

    lessonId: text("lesson_id").notNull(),

    answer: text("answer").notNull(),

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
        columns: [table.lessonId],
        foreignColumns: [lessons.id],
        name: "answers_lesson_id_fk",
    }).onDelete("restrict"),

    index("answers_lesson_id_idx").on(
        table.lessonId
    )
]);

export const questionAnswers = sqliteTable("question_answers", {
    id: text("id").primaryKey(),

    questionId: text("question_id").notNull(),

    answerId: text("answer_id").notNull(),

    isCorrect: integer("is_correct", {
        mode: "boolean"
    }).notNull().default(false),

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
    unique("question_answer_unique").on(
        table.questionId,
        table.answerId
    ),
    foreignKey({
        columns: [table.questionId],
        foreignColumns: [questions.id],
        name: "question_answers_question_id_fk",
    }).onDelete("restrict"),

    foreignKey({
        columns: [table.answerId],
        foreignColumns: [answers.id],
        name: "question_answers_answer_id_fk",
    }).onDelete("restrict"),
]);