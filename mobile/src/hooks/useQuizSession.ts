import { startOrResumeQuiz, resetQuiz } from "@/repositories/quiz.repository";
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

  const fetchedQuestionIds = useMemo(() => 
    new Set(questions.map(
      (question) => question.id)
    ), [questions]
  );

  const activeQuestionIds = useMemo(() => 
    quizQuestionIds.filter(
      (id) => fetchedQuestionIds.has(id)
    ), [quizQuestionIds, fetchedQuestionIds]
  );

  useEffect(() => {
    if (!lessonId || isLoading) return;

    const hasNewQuestions = questions.some(
      (question) => !syncedIdsRef.current.has(question.id),
    );

    if (quizInitialized && !hasNewQuestions) {
      syncedIdsRef.current = fetchedQuestionIds;
      return;
    }

    if (questions.length === 0) {
      setQuizQuestionIds([]);
      syncedIdsRef.current = fetchedQuestionIds;
      setQuizInitialized(true);
      return;
    }

    const initializeQuiz = async () => {
      try {
        const activeIds = await startOrResumeQuiz(
          lessonId,
          Array.from(fetchedQuestionIds),
        );

        setQuizQuestionIds(activeIds);
        syncedIdsRef.current = fetchedQuestionIds;

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

    await resetQuiz(lessonId);

    const activeIds = await startOrResumeQuiz(
      lessonId,
      Array.from(fetchedQuestionIds),
    );

    setQuizQuestionIds(activeIds);
    syncedIdsRef.current = fetchedQuestionIds;
  };

  return {
    quizQuestionIds: activeQuestionIds,
    quizInitialized,
    reset,
  };
}

export default useQuizSession;