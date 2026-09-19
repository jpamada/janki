import { startOrResumeQuiz } from "@/repositories/progress.repository";
import { resetQuizSession } from "@/repositories/quiz.repository";
import { useEffect, useState } from "react";

type Question = {
  id: string;
  lessonId: string;
  question: string;
};

export function useQuizSession(
  lessonId: string | undefined,
  questions: Question[],
  isLoading: boolean,
) {
  const [quizQuestionIds, setQuizQuestionIds] = useState<string[]>([]);
  const [quizInitialized, setQuizInitialized] = useState(false);

  useEffect(() => {
    if (!lessonId || isLoading || quizInitialized) return;

    if (questions.length === 0) {
      setQuizQuestionIds([]);
      setQuizInitialized(true);
      return;
    }

    const initializeQuiz = async () => {
      try {
        const questionIds = questions.map(
          (question) => question.id
        );

        const activeQuestionIds = await startOrResumeQuiz(lessonId, questionIds);
        setQuizQuestionIds(activeQuestionIds);

      } catch (error) {
        console.error(error);

      } finally {
        setQuizInitialized(true);
      }
    };

    initializeQuiz();
  }, [lessonId, questions, isLoading, quizInitialized]);

  const reset = async () => {
    if (!lessonId) return;
    await resetQuizSession(lessonId);

    const activeQuestionIds = await startOrResumeQuiz(
      lessonId,
      questions.map((question) => question.id),
    );

    setQuizQuestionIds(activeQuestionIds);
  };

  return { quizQuestionIds, quizInitialized, reset };
}