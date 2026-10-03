import { webSubjects } from "./web-data";

export async function getSubjects() {
  return webSubjects.map(
    ({ lessons, ...subject }) => subject,
  );
}

export async function getSubjectsByCategory(
  categoryId?: string | null,
) {
  const subjects = webSubjects.filter((subject) =>
    categoryId?.trim()
      ? subject.categoryId === categoryId
      : subject.categoryId === null,
  );

  return subjects.map((subject) => ({
    ...subject,
    lessons: [...subject.lessons]
      .sort((a, b) => a.position - b.position)
      .map((lesson) => ({
        ...lesson,
        dueCount: 0,
      })),
  }));
}

export async function getSubjectById(id: string) {
  const subject = webSubjects.find(
    (subject) => subject.id === id,
  );

  if (!subject) {
    return undefined;
  }

  const { lessons, ...subjectData } = subject;

  return subjectData;
}

export async function createSubject(input: {
  name: string;
  categoryId?: string | null;
}) {
  webSubjects.push({
    id: `subject-${Date.now()}`,
    name: input.name,
    categoryId: input.categoryId ?? null,
    createdAt: new Date(),
    updatedAt: null,
    lessons: [],
  });
}

export async function updateSubject(
  id: string,
  input: {
    name: string;
    categoryId?: string | null;
  },
) {
  const subject = webSubjects.find(
    (subject) => subject.id === id,
  );

  if (!subject) {
    return;
  }

  subject.name = input.name;
  subject.categoryId = input.categoryId ?? null;
  subject.updatedAt = new Date();
}

export async function deleteSubject(id: string) {
  const index = webSubjects.findIndex(
    (subject) => subject.id === id,
  );

  if (index !== -1) {
    webSubjects.splice(index, 1);
  }
}

export async function hasDefaultSubjects() {
  return webSubjects.some(
    (subject) => subject.categoryId === null,
  );
}