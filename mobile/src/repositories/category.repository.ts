import { categories } from "@/db/schema";
import { db } from "@/db/client";
import { eq } from "drizzle-orm";

import * as Crypto from "expo-crypto";

export async function getCategories() {
  const query = await db
  .select()
  .from(categories);

  return query;
}

export async function getCategoryById(id: string) {
  const query = await db
  .select()
  .from(categories)
  .where(
    eq(categories.id, id)
  )
  .limit(1);

  return query[0] ?? null;
}

export async function createCategory(
  input: {
    name: string;
}) {
  const categoryId = Crypto.randomUUID();
  await db
  .insert(categories)
  .values({
    id: categoryId,
    name: input.name
  });
}

export async function updateCategory(
  id: string,
  input: {
    name: string;
}) {
  await db
  .update(categories)
  .set({
    name: input.name
  })
  .where(
    eq(categories.id, id)
  );
}

export async function deleteCategory(id: string) {
  await db
  .delete(categories)
  .where(
    eq(categories.id, id)
  );
}
