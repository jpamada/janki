import { webQuestions } from './web-data';

export async function getQuizData(lessonId: string) {
  return webQuestions
    .filter((question) => question.lessonId === lessonId)
    .map((question) => ({
      ...question,
      type: 'identification' as const,
      questionAnswers: [
        {
          answer: {
            id: `${question.id}-answer`,
            answer: question.answer,
          },
          isCorrect: true,
        },
      ],
    }));
}

export async function createQuizData(input: {
  lessonId: string;
  question: string;
  answer: string;
  explanation?: string | null;
  language?: string | null;
}) {
  webQuestions.push({
    id: `question-${Date.now()}`,
    lessonId: input.lessonId,
    question: input.question,
    answer: input.answer,
    explanation: input.explanation ?? null,
    language: input.language ?? null,
  });
}

export async function updateQuizData(
  id: string,
  input: {
    lessonId: string;
    question: string;
    answer: string;
    explanation?: string | null;
    language?: string | null;
  },
) {
  const question = webQuestions.find(
    (question) => question.id === id,
  );

  if (!question) {
    return;
  }

  question.lessonId = input.lessonId;
  question.question = input.question;
  question.answer = input.answer;
  question.explanation = input.explanation ?? null;
  question.language = input.language ?? null;
}