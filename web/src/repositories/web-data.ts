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
    categoryId: 'category-1',
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
      {
        id: 'lesson-3',
        subjectId: 'subject-1',
        name: 'Arrays',
        position: 2,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-4',
        subjectId: 'subject-1',
        name: 'Objects',
        position: 3,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
    ],
  },
  {
    id: 'subject-2',
    name: 'TypeScript',
    categoryId: 'category-1',
    createdAt: new Date(),
    updatedAt: null,
    lessons: [
      {
        id: 'lesson-5',
        subjectId: 'subject-2',
        name: 'Basic Types',
        position: 0,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-6',
        subjectId: 'subject-2',
        name: 'Interfaces',
        position: 1,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-7',
        subjectId: 'subject-2',
        name: 'Generics',
        position: 2,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-8',
        subjectId: 'subject-2',
        name: 'Utility Types',
        position: 3,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
    ],
  },
  {
    id: 'subject-3',
    name: 'React',
    categoryId: 'category-1',
    createdAt: new Date(),
    updatedAt: null,
    lessons: [
      {
        id: 'lesson-9',
        subjectId: 'subject-3',
        name: 'Components',
        position: 0,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-10',
        subjectId: 'subject-3',
        name: 'Props',
        position: 1,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-11',
        subjectId: 'subject-3',
        name: 'State',
        position: 2,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-12',
        subjectId: 'subject-3',
        name: 'Hooks',
        position: 3,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
    ],
  },
  {
    id: 'subject-4',
    name: 'React Native',
    categoryId: 'category-1',
    createdAt: new Date(),
    updatedAt: null,
    lessons: [
      {
        id: 'lesson-13',
        subjectId: 'subject-4',
        name: 'Core Components',
        position: 0,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-14',
        subjectId: 'subject-4',
        name: 'Styling',
        position: 1,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-15',
        subjectId: 'subject-4',
        name: 'Navigation',
        position: 2,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-16',
        subjectId: 'subject-4',
        name: 'Gestures',
        position: 3,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
    ],
  },
  {
    id: 'subject-5',
    name: 'SQL',
    categoryId: 'category-1',
    createdAt: new Date(),
    updatedAt: null,
    lessons: [
      {
        id: 'lesson-17',
        subjectId: 'subject-5',
        name: 'SELECT Queries',
        position: 0,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-18',
        subjectId: 'subject-5',
        name: 'Filtering',
        position: 1,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-19',
        subjectId: 'subject-5',
        name: 'JOINs',
        position: 2,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-20',
        subjectId: 'subject-5',
        name: 'Aggregation',
        position: 3,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
    ],
  },
  {
    id: 'subject-6',
    name: 'Mathematics',
    categoryId: 'category-2',
    createdAt: new Date(),
    updatedAt: null,
    lessons: [
      {
        id: 'lesson-21',
        subjectId: 'subject-6',
        name: 'Algebra',
        position: 0,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-22',
        subjectId: 'subject-6',
        name: 'Geometry',
        position: 1,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-23',
        subjectId: 'subject-6',
        name: 'Probability',
        position: 2,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-24',
        subjectId: 'subject-6',
        name: 'Statistics',
        position: 3,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
    ],
  },
  {
    id: 'subject-7',
    name: 'Algorithms',
    categoryId: 'category-1',
    createdAt: new Date(),
    updatedAt: null,
    lessons: [
      {
        id: 'lesson-25',
        subjectId: 'subject-7',
        name: 'Big O Notation',
        position: 0,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-26',
        subjectId: 'subject-7',
        name: 'Searching',
        position: 1,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-27',
        subjectId: 'subject-7',
        name: 'Sorting',
        position: 2,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-28',
        subjectId: 'subject-7',
        name: 'Recursion',
        position: 3,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
    ],
  },
  {
    id: 'subject-8',
    name: 'Git',
    categoryId: 'category-1',
    createdAt: new Date(),
    updatedAt: null,
    lessons: [
      {
        id: 'lesson-29',
        subjectId: 'subject-8',
        name: 'Repositories',
        position: 0,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-30',
        subjectId: 'subject-8',
        name: 'Branches',
        position: 1,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-31',
        subjectId: 'subject-8',
        name: 'Merging',
        position: 2,
        favorite: false,
        createdAt: new Date(),
        updatedAt: null,
      },
      {
        id: 'lesson-32',
        subjectId: 'subject-8',
        name: 'Remote Repositories',
        position: 3,
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