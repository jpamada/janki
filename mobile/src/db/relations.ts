import { answers, categories, folders, lessons, notes, questionAnswers, questions, subfolders } from "./schema";
import { relations } from "drizzle-orm";

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

export const questionsRelations = relations(questions, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [questions.lessonId],
    references: [lessons.id],
  }),

  questionAnswers: many(questionAnswers),
}));

export const answersRelations = relations(answers, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [answers.lessonId],
    references: [lessons.id],
  }),

  questionAnswers: many(questionAnswers),
}));

export const questionAnswersRelations = relations(
  questionAnswers,
  ({ one }) => ({
    question: one(questions, {
      fields: [questionAnswers.questionId],
      references: [questions.id],
    }),

    answer: one(answers, {
      fields: [questionAnswers.answerId],
      references: [answers.id],
    }),
  }),
);