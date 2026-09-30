import { answers, categories, lessons, questionAnswers, questions, progress, subjects, history } from "./schema";
import { relations } from "drizzle-orm";

export const categoriesRelations = relations(categories, ({ many }) => ({
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects,  ({ one, many }) => ({
  category: one(categories, {
    fields: [subjects.categoryId],
    references: [categories.id]
  }),
  
  lessons: many(lessons)
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
    subject: one(subjects, {
      fields: [lessons.subjectId],
      references: [subjects.id],
    }),

    questions: many(questions),

    answers: many(answers),
  }),
);

export const questionsRelations = relations(questions, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [questions.lessonId],
    references: [lessons.id],
  }),

  progress: one(progress, { 
    fields: [questions.id], 
    references: [progress.questionId] 
  }),
  
  history: many(history),

  questionAnswers: many(questionAnswers),
}));

export const answersRelations = relations(answers, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [answers.lessonId],
    references: [lessons.id],
  }),

  questionAnswers: many(questionAnswers),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  question: one(questions, { 
    fields: [progress.questionId], 
    references: [questions.id] 
  }),
}));

export const historyRelations = relations(history, ({ one }) => ({
  question: one(questions, {
    fields: [history.questionId],
    references: [questions.id]
  })
}));

export const questionAnswersRelations = relations(questionAnswers, ({ one }) => ({
  question: one(questions, {
    fields: [questionAnswers.questionId],
    references: [questions.id],
  }),

  answer: one(answers, {
    fields: [questionAnswers.answerId],
    references: [answers.id],
  }),
}));