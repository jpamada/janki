import { foreignKey, index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

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
    }).onDelete("restrict"),

    index("folders_folder_id_idx").on(
        table.parentId
    ),
]);

export const notes = sqliteTable("notes", {
    id: text("id").primaryKey(),

    folderId: text("folder_id"),

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
        name: "folder_id_fk",
    }).onDelete("cascade"),

    index("notes_folder_id_idx").on(
        table.folderId
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
        name: "note_id_fk"
    }).onDelete("cascade"),

    index("note_sections_note_id_idx").on(
        table.noteId
    ),
]);

export const noteContents = sqliteTable("note_contents", {
    id: text("id").primaryKey(),

    noteSectionId: text("note_section_id").notNull(),

    title: text("title"),

    content: text("content").notNull(),

    type: text("type").notNull(),

    url: text("url"),

    remarks: text("remarks"),

    position: integer("position"),

}, (table) => [
    foreignKey({
        columns: [table.noteSectionId],
        foreignColumns: [noteSections.id],
        name: "note_section_id_fk"
    }).onDelete("cascade"),

    index("note_contents_note_section_id_idx").on(
        table.noteSectionId
    ),
]);

export const subjects = sqliteTable("subjects", {
    id: text("id").primaryKey(),

    title: text("title").notNull(),

    category: text("category").notNull(),

    createdAt: integer("created_at", {
        mode: "timestamp_ms"
    }).notNull(),

    updatedAt: integer("updated_at", {
        mode: "timestamp_ms"
    }),

    deletedAt: integer("deleted_at", {
        mode: "timestamp_ms"
    }),
});

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
        name: "subject_id_fk",
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
        name: "lesson_id_fk",
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
        name: "lesson_id_fk",
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
        name: "question_id_fk",
    }).onDelete("restrict"),

    foreignKey({
        columns: [table.answerId],
        foreignColumns: [answers.id],
        name: "answer_id_fk",
    }).onDelete("restrict"),
]);