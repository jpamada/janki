import { eq, isNull } from "drizzle-orm";
import { subjects } from "@/db/schema";
import { db } from "@/db/client";

import * as Crypto from "expo-crypto";

export async function getSubjects() {
  const query = await db
  .select()
  .from(subjects);

  return query;
}

export async function getSubjectsByCategory(
  categoryId?: string | null,
) {
  const now = new Date();

  const subjectsData = await db.query.subjects.findMany({
    columns: {
      id: true,
      name: true,
      categoryId: true,
    },
    where: categoryId?.trim()
      ? eq(subjects.categoryId, categoryId)
      : isNull(subjects.categoryId),
    with: {
      lessons: {
        columns: {
          id: true,
          name: true,
          favorite: true,
          subjectId: true,
        },
        orderBy: (lessonsTable, { asc }) => [
          asc(lessonsTable.position),
        ],
        with: {
          questions: {
            columns: {
              id: true,
            },
            with: {
              progress: {
                columns: {
                  nextattemptedAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const subjectsWithDueCount = subjectsData.map((subject) => {
    const lessons = subject.lessons.map((lesson) => {
      const dueQuestions = lesson.questions.filter((question) => {
        const progress = question.progress;

        if (!progress) {
          return true;
        }

        if (progress.nextattemptedAt === null) {
          return true;
        }

        return progress.nextattemptedAt.getTime() <= now.getTime();
      });

      const dueCount = dueQuestions.length;

      return {
        ...lesson,
        dueCount,
      };
    });

    return {
      ...subject,
      lessons,
    };
  });

  return subjectsWithDueCount;
}

export async function getSubjectById(id: string) {
  const query = await db
  .select()
  .from(subjects)
  .where(
    eq(subjects.id, id)
  )
  .limit(1);

  return query[0];
}

export async function createSubject(
  input: {
    name: string;
    categoryId?: string | null;
}) {
  const subjectId = Crypto.randomUUID();

  await db
  .insert(subjects)
  .values({
    id: subjectId,
    name: input.name,
    categoryId: input.categoryId ?? null,
    createdAt: new Date()
  });
};

export async function updateSubject(
  id: string,
  input: {
    name: string;
    categoryId?: string | null;
}) {
  await db
  .update(subjects)
  .set({
    name: input.name,
    categoryId: input.categoryId ?? null,
    updatedAt: new Date(),
  })
  .where(
    eq(subjects.id, id)
  );
};

export async function deleteSubject(id: string) {
  await db
  .delete(subjects)
  .where(
    eq(subjects.id, id)
  );
};

export async function hasDefaultSubjects() {
  const subject = await db.query.subjects
  .findFirst({
    where: isNull(subjects.categoryId),
  });

  return !!subject;
}