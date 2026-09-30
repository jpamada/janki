import { db } from "@/db/client";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function initializeSettings() {
  await db
  .insert(settings)
  .values({
    id: "default",
  })
  .onConflictDoNothing();
} 


export async function getSettings() {
  const [query] = await db
  .select()
  .from(settings)
  .where(
    eq(settings.id, "default")
  );

  return query;
}

export async function updateTheme(
  theme: "light" | "dark" | "system",
) {
  await db
  .update(settings)
  .set({
    theme: theme
  })
  .where(
    eq(settings.id, "default")
  );
}


export async function updateTextAlign(
  questionTextAlign: "left" | "center" | "justify",
) {
  await db
  .update(settings)
  .set({
    questionTextAlign: questionTextAlign
  })
  .where(
    eq(settings.id, "default")
  );
}


export async function updateFontSize(
  questionFontSize: number,
) {
  await db
  .update(settings)
  .set({
    questionFontSize: questionFontSize
  })
  .where(
    eq(settings.id, "default")
  );
}

export async function updateCaseSensitivity(
  isTrue: boolean,
) {
   await db
  .update(settings)
  .set({
    caseSensitive: isTrue
  })
  .where(
    eq(settings.id, "default")
  );
}

export async function updateShowCorrectAnswer(
  isTrue: boolean,
) {
   await db
  .update(settings)
  .set({
    showCorrectAnswer: isTrue
  })
  .where(
    eq(settings.id, "default")
  );
}

export async function updateHapticsEnabled(
  isTrue: boolean,
) {
   await db
  .update(settings)
  .set({
    hapticsEnabled: isTrue
  })
  .where(
    eq(settings.id, "default")
  );
}

export async function updateSoundEnabled(
  isTrue: boolean,
) {
   await db
  .update(settings)
  .set({
    soundEnabled: isTrue
  })
  .where(
    eq(settings.id, "default")
  );
}