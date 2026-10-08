import { foreignKey, index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
    id: text("id").primaryKey(),

    name: text("name").notNull(),

    position: integer("position").notNull().default(0),

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

export const subjects = sqliteTable("subjects", {
    id: text("id").primaryKey(),

    name: text("name").notNull(),

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

    name: text("name").notNull(),
    
    position: integer("position").notNull().default(0),

    favorite: integer("favorite", {
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
    foreignKey({
        columns: [table.subjectId],
        foreignColumns: [subjects.id],
        name: "lessons_subject_id_fk",
    }).onDelete("cascade"),

    index("lessons_subject_id_idx").on(
        table.subjectId
    )
]);

export const questions = sqliteTable("questions", {
    id: text("id").primaryKey(),

    lessonId: text("lesson_id").notNull(),

    question: text("question").notNull(),

    explanation: text("explanation"),

    image: text("image"),

    code: text("code"),

    language: text("language"),

    type: text("type", {
        enum: [
            "multiple_choice",
            "identification",
        ],
    }).notNull().default("multiple_choice"),

    createdAt: integer("created_at", {
        mode: "timestamp_ms",
    }).notNull(),

    updatedAt: integer("updated_at", {
        mode: "timestamp_ms",
    }),

    deletedAt: integer("deleted_at", {
        mode: "timestamp_ms",
    }),

}, (table) => [
    foreignKey({
        columns: [table.lessonId],
        foreignColumns: [lessons.id],
        name: "questions_lesson_id_fk",
    }).onDelete("cascade"),

    index("questions_lesson_id_idx").on(table.lessonId),
]);

export const progress = sqliteTable("progress", {
    id: text("id").primaryKey(),

    questionId: text("question_id").notNull(),

    reviewInterval: text("review_interval", {
        enum: ["1_day", "3_days", "7_days"],
    }),

    lastattemptedAt: integer("last_attempt_date", {
        mode: "timestamp_ms",
    }),

    nextattemptedAt: integer("next_attempt_date", {
        mode: "timestamp_ms",
    }),

}, (table) => [
    foreignKey({
        columns: [table.questionId],
        foreignColumns: [questions.id],
        name: "progress_question_id_fk",
    }).onDelete("cascade"),

    unique("progress_question_unique").on(
        table.questionId
    ),

    index("progress_next_attempt_date_idx").on(
        table.nextattemptedAt
    ),
]);

export const history = sqliteTable("history", {
    id: text("id").primaryKey(),

    questionId: text("question_id").notNull(),

    answer: text("answer"),

    responseTime: integer("response_time"),

    attemptedAt: integer("attemptedAt", {
        mode: "timestamp_ms"
    }).notNull(),

    status: text("status", {
        enum: ["correct", "incorrect"],
    }).notNull(),

}, (table) => [
    foreignKey({
        columns: [table.questionId],
        foreignColumns: [questions.id],
        name: "question_history_id_fk",
    }).onDelete("cascade"),

    index("history_question_id_idx").on(
        table.questionId
    ),

    index("history_attempt_date_idx").on(
        table.attemptedAt
    ),
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
    }).onDelete("cascade"),

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
    }).onDelete("cascade"),

    foreignKey({
        columns: [table.answerId],
        foreignColumns: [answers.id],
        name: "question_answers_answer_id_fk",
    }).onDelete("cascade"),
]);