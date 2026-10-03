import { webSubjects } from "./web-data";

export async function getLessons() {
  return webSubjects.flatMap((subject) =>
    subject.lessons.filter(
      (lesson) => lesson.deletedAt === null,
    ),
  );
}

export async function getFavoriteLessons() {
  return webSubjects.flatMap((subject) =>
    subject.lessons
      .filter((lesson) => lesson.favorite)
      .map((lesson) => ({
        ...lesson,
        subject: {
          id: subject.id,
          name: subject.name,
          categoryId: subject.categoryId,
          createdAt: subject.createdAt,
          updatedAt: subject.updatedAt,
        },
      })),
  );
}

export async function createLesson(input: {
  name: string;
  subjectId: string;
}) {
  const subject = webSubjects.find(
    (subject) => subject.id === input.subjectId,
  );

  if (!subject) {
    throw new Error("Subject not found");
  }

  subject.lessons.push({
    id: `lesson-${Date.now()}`,
    name: input.name,
    position: subject.lessons.length,
    subjectId: input.subjectId,
    favorite: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: null,
  });
}

export async function updateLesson(
  id: string,
  input: {
    name: string;
    subjectId: string;
    favorite: boolean;
  },
) {
  const lesson = findLesson(id);

  if (!lesson) {
    return;
  }

  lesson.name = input.name;
  lesson.favorite = input.favorite;
  lesson.subjectId = input.subjectId;
  lesson.updatedAt = new Date();
}

export async function toggleLessonFavorite(
  id: string,
  favorite: boolean,
) {
  const lesson = findLesson(id);

  if (!lesson) {
    return;
  }

  lesson.favorite = favorite;
  lesson.updatedAt = new Date();
}

export async function swapLessonPosition(
  lessonId: string,
  targetLessonId: string,
) {
  const lesson = findLesson(lessonId);
  const targetLesson = findLesson(targetLessonId);

  if (!lesson || !targetLesson) {
    throw new Error("Lesson not found");
  }

  const position = lesson.position;

  lesson.position = targetLesson.position;
  targetLesson.position = position;
}

export async function deleteLesson(id: string) {
  const lesson = findLesson(id);

  if (!lesson) {
    return;
  }

  lesson.deletedAt = new Date();
}

function findLesson(id: string) {
  for (const subject of webSubjects) {
    const lesson = subject.lessons.find(
      (lesson) => lesson.id === id,
    );

    if (lesson) {
      return lesson;
    }
  }

  return undefined;
}