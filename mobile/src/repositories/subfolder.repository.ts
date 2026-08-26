import { subfolders } from "@/db/schema";
import { db } from "@/db/client";
import { eq } from "drizzle-orm";

import * as Crypto from "expo-crypto";

export async function getSubfolders() {
  const query = await db
  .select()
  .from(subfolders);

  return query;
}

export async function getSubfolderById(id: string) {
  const query = await db
  .select()
  .from(subfolders)
  .where(
    eq(subfolders.id, id)
  )
  .limit(1);

  return query[0] ?? null;
}

export async function createSubfolder(
  input: {
    name: string;
    folderId: string;
}) {
  const subfolderId = Crypto.randomUUID();
  await db
  .insert(subfolders)
  .values({
    id: subfolderId,
    name: input.name,
    folderId: input.folderId,
    createdAt: new Date()
  });
}

export async function updateSubfolder(
  id: string,
  input: {
    name: string;
    folderId: string;
}) {
  await db
  .update(subfolders)
  .set({
    name: input.name,
    folderId: input.folderId,
    updatedAt: new Date()
  })
  .where(
    eq(subfolders.id, id)
  );
}

export async function deleteSubfolder(id: string) {
  await db
  .delete(subfolders)
  .where(
    eq(subfolders.id, id)
  );
}
