export type QuizQuestion = {
  id: string;
  question: string;
  answers: {
    id: string;
    answer: string;
    isCorrect: boolean;
  }[];
};

export type QuestionWithAnswerRow = {
  questionId: string;
  question: string;
  answerId: string;
  answer: string;
  isCorrect: boolean;
};

export function mapQuestionsWithAnswers(
  rows: QuestionWithAnswerRow[],
): QuizQuestion[] {
  const questions = new Map<string, QuizQuestion>();

  for (const row of rows) {
    let question = questions.get(row.questionId);

    if (!question) {
      question = {
        id: row.questionId,
        question: row.question,
        answers: [],
      };

      questions.set(row.questionId, question);
    }

    question.answers.push({
      id: row.answerId,
      answer: row.answer,
      isCorrect: row.isCorrect,
    });
  }

  return Array.from(questions.values());
}