import { subjects, progress } from "@/db/schema";
import { todayKey } from "@/constants/date";
import { eq, isNull } from "drizzle-orm";
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
  const date = todayKey();

  let query;

  if (categoryId?.trim()) {
    query = await db.query.subjects
    .findMany({
      where: eq(
        subjects.categoryId,
        categoryId,
      ),
      with: {
        lessons: {
          with: {
            questions: true,
            progress: {
              where: eq(
                progress.sessionDate,
                date,
              ),
            },
          },
        },
      },
    });

  } else {
    query = await db.query.subjects
    .findMany({
      where: isNull(subjects.categoryId),
      with: {
        lessons: {
          with: {
            questions: true,
            progress: {
              where: eq(
                progress.sessionDate,
                date,
              ),
            },
          },
        },
      },
    });
  }

  return query;
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