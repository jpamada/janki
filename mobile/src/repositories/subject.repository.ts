import { and, eq, isNull } from "drizzle-orm";
import { subjects } from "@/db/schema";
import { db } from "@/db/client";

export async function getSubjects() {
  const query = await db
  .select()
  .from(subjects);

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
    id: string;
    title: string;
    category: string;
}) {
  await db
  .insert(subjects)
  .values({
    id: input.id,
    title: input.title,
    category: input.category,
    createdAt: new Date()
  });
};

export async function updateSubject(
  id: string,
  input: {
    title: string;
    category: string;
}) {
  await db
  .update(subjects)
  .set({
    title: input.title,
    category: input.category,
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