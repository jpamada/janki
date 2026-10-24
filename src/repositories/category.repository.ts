import { categories, subjects } from "@/db/schema";
import { asc, eq, max } from "drizzle-orm";
import { db } from "@/db/client";

import * as Crypto from "expo-crypto";

export async function getCategories() {
  const query = await db.query.categories
  .findMany({
    with: {
      subjects: true
    },
    orderBy: asc(categories.position)
  })

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
  }
) {
  const categoryId = Crypto.randomUUID();

  await db.transaction(async (tx) => {
    const [query] = await tx
    .select({
      maxPosition: max(categories.position),
    })
    .from(categories);

    await tx
    .insert(categories)
    .values({
      id: categoryId,
      name: input.name,
      position: (query.maxPosition ?? -1) + 1,
      createdAt: new Date(),
    });
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
    name: input.name,
    updatedAt: new Date()
  })
  .where(
    eq(categories.id, id)
  );
}

export async function swapCategoryPosition(
  categoryId: string,
  targetCategoryId: string,
) {
  await db.transaction(async (tx) => {
    const [category] = await tx
      .select({ position: categories.position })
      .from(categories)
      .where(eq(categories.id, categoryId));

    const [targetCategory] = await tx
      .select({ position: categories.position })
      .from(categories)
      .where(eq(categories.id, targetCategoryId));

    if (!category || !targetCategory) {
      throw new Error("Category not found");
    }

    await tx
      .update(categories)
      .set({ position: targetCategory.position })
      .where(eq(categories.id, categoryId));

    await tx
      .update(categories)
      .set({ position: category.position })
      .where(eq(categories.id, targetCategoryId));
  });
}

export async function deleteCategory(id: string) {
  await db.transaction(async (tx) => {
    await tx
    .update(subjects)
    .set({ 
      categoryId: null, 
      updatedAt: new Date() 
    })
    .where(
      eq(subjects.categoryId, id)
    );

    await tx
    .delete(categories)
    .where(eq(categories.id, id));
  });
}