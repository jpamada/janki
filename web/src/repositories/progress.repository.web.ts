import { webProgress, webQuestions } from "./web-data";

function getProgress(questionId: string) {
  return webProgress.find(
    (progress) => progress.questionId === questionId,
  );
}

function createProgress(questionId: string) {
  const progress = {
    id: `progress-${Date.now()}-${questionId}`,
    questionId,
    attempts: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
    consecutiveCorrect: 0,
    lastAttemptDate: null,
    nextAttemptDate: null,
  };

  webProgress.push(progress);

  return progress;
}

export async function getDueQuestionIds() {
  const now = new Date();

  return webQuestions
    .filter((question) => {
      const progress = getProgress(question.id);

      if (!progress) {
        return true;
      }

      if (!progress.nextAttemptDate) {
        return true;
      }

      return progress.nextAttemptDate.getTime() <= now.getTime();
    })
    .map((question) => question.id);
}

export async function recordCorrectAnswerProgress(
  questionId: string,
) {
  const progress =
    getProgress(questionId) ??
    createProgress(questionId);

  const now = new Date();

  progress.attempts += 1;
  progress.correctAttempts += 1;
  progress.consecutiveCorrect += 1;
  progress.lastAttemptDate = now;
  progress.nextAttemptDate = now;
}

export async function recordIncorrectAnswerProgress(
  questionId: string,
) {
  const progress =
    getProgress(questionId) ??
    createProgress(questionId);

  const now = new Date();

  progress.attempts += 1;
  progress.incorrectAttempts += 1;
  progress.consecutiveCorrect = 0;
  progress.lastAttemptDate = now;
  progress.nextAttemptDate = now;
}

export async function resetProgressForQuestions(
  questionIds: string[],
) {
  for (const questionId of questionIds) {
    const progress = getProgress(questionId);

    if (!progress) {
      continue;
    }

    progress.attempts = 0;
    progress.correctAttempts = 0;
    progress.incorrectAttempts = 0;
    progress.consecutiveCorrect = 0;
    progress.lastAttemptDate = null;
    progress.nextAttemptDate = null;
  }
}

export async function deleteProgress() {
  webProgress.length = 0;
}