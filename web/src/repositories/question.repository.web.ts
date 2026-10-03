import { webQuestions } from "./web-data";

export async function getQuestionsByLessonId(
  lessonId: string,
) {
  return webQuestions.filter(
    (question) => question.lessonId === lessonId,
  );
}

export async function getQuestionById(id: string) {
  return (
    webQuestions.find(
      (question) => question.id === id,
    ) ?? null
  );
}

export async function deleteQuestion(id: string) {
  const index = webQuestions.findIndex(
    (question) => question.id === id,
  );

  if (index !== -1) {
    webQuestions.splice(index, 1);
  }
}