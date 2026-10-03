export type Question = {
  id: string;
  lessonId: string;
  question: string;
  answer: string;
  explanation: string | null;
  language: string | null;
};

export type Progress = {
  id: string;
  questionId: string;
  attempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  consecutiveCorrect: number;
  lastAttemptDate: Date | null;
  nextAttemptDate: Date | null;
};

export type History = {
  id: string;
  questionId: string;
  responseTime: number | null;
  attemptDate: Date;
  status: "unanswered" | "correct" | "incorrect";
  answeredAt: Date | null;
};

export type Lesson = {
  id: string;
  subjectId: string;
  name: string;
  position: number;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date | null;
};

export const webQuestions: Question[] = [
  {
    id: "question-1",
    lessonId: "lesson-1",
    question: "What keyword declares a variable that can be reassigned?",
    answer: "let",
    explanation: "The let keyword declares a block-scoped variable that can be reassigned.",
    language: "javascript",
  },
  {
    id: "question-2",
    lessonId: "lesson-2",
    question: "What keyword declares a JavaScript function?",
    answer: "function",
    explanation: "The function keyword can be used to declare a function.",
    language: "javascript",
  },
];

export const webProgress: Progress[] = [];

export const webHistory: History[] = [];

export const webSettings = {
  soundEnabled: true,
  caseSensitive: false,
  hapticsEnabled: true,
  showExplanation: true,
  questionFontSize: 16,
  showCorrectAnswer: true,
  theme: "system" as "system" | "light" | "dark",
  questionTextAlign: "left" as "left" | "center" | "justify",
};

export type Subject = {
  id: string;
  name: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  lessons: Lesson[];
};

export const webSubjects: Subject[] = [
  {
    id: 'subject-1',
    name: 'JavaScript',
    categoryId: null,
    createdAt: new Date(),
    updatedAt: null,
    lessons: [
      {
        id: 'lesson-1',
        subjectId: 'subject-1',
        name: 'Variables',
        position: 0,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-2',
        subjectId: 'subject-1',
        name: 'Functions',
        position: 1,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
    ],
  },
];

export type Category = {
  id: string;
  name: string;
  position: number;
  createdAt: Date;
  updatedAt: Date | null;
};

export const webCategories: Category[] = [
  {
    id: 'category-1',
    name: 'Programming',
    position: 0,
    createdAt: new Date(),
    updatedAt: null,
  },
  {
    id: 'category-2',
    name: 'Mathematics',
    position: 1,
    createdAt: new Date(),
    updatedAt: null,
  },
];