import { startOrResumeQuiz } from "@/repositories/progress.repository";
import { resetQuizSession } from "@/repositories/quiz.repository";
import { useEffect, useMemo, useRef, useState } from "react";

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

  const syncedIdsRef = useRef<Set<string>>(new Set());

  const currentQuestionIds = useMemo(
    () => new Set(questions.map((question) => question.id)),
    [questions],
  );

  const activeQuizQuestionIds = useMemo(
    () =>
      quizQuestionIds.filter((id) =>
        currentQuestionIds.has(id),
      ),
    [quizQuestionIds, currentQuestionIds],
  );

  useEffect(() => {
    if (!lessonId || isLoading) return;

    const currentIds = new Set(
      questions.map((question) => question.id),
    );

    const hasNewQuestions = questions.some(
      (question) => !syncedIdsRef.current.has(question.id),
    );

    if (quizInitialized && !hasNewQuestions) {
      syncedIdsRef.current = currentIds;
      return;
    }

    if (questions.length === 0) {
      setQuizQuestionIds([]);
      syncedIdsRef.current = currentIds;
      setQuizInitialized(true);
      return;
    }

    const initializeQuiz = async () => {
      try {
        const questionIds = questions.map(
          (question) => question.id,
        );

        const activeQuestionIds = await startOrResumeQuiz(
          lessonId,
          questionIds,
        );

        setQuizQuestionIds(activeQuestionIds);
        syncedIdsRef.current = currentIds;
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

  return {
    quizQuestionIds: activeQuizQuestionIds,
    quizInitialized,
    reset,
  };
}

export default useQuizSession;