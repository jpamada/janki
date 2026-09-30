import { categories, subjects, lessons, questions, answers, questionAnswers, progress, history } from './schema';
import { File, Paths } from 'expo-file-system';
import { db } from './client';

import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

type BackupPayload = {
  version: number;
  exportedAt: string;
  data: {
    categories: (typeof categories.$inferSelect)[];
    subjects: (typeof subjects.$inferSelect)[];
    lessons: (typeof lessons.$inferSelect)[];
    questions: (typeof questions.$inferSelect)[];
    answers: (typeof answers.$inferSelect)[];
    questionAnswers: (typeof questionAnswers.$inferSelect)[];
    progress: (typeof progress.$inferSelect)[];
    history: (typeof history.$inferSelect)[];
  };
};

export async function exportData() {
  const [
    categoriesData,
    subjectsData,
    lessonsData,
    questionsData,
    answersData,
    questionAnswersData,
    progressData,
    historyData,
  ] = await Promise.all([
    db.select().from(categories),
    db.select().from(subjects),
    db.select().from(lessons),
    db.select().from(questions),
    db.select().from(answers),
    db.select().from(questionAnswers),
    db.select().from(progress),
    db.select().from(history),
  ]);

  const payload: BackupPayload = {
    version: 3,
    exportedAt: new Date().toISOString(),
    data: {
      categories: categoriesData,
      subjects: subjectsData,
      lessons: lessonsData,
      questions: questionsData,
      answers: answersData,
      questionAnswers: questionAnswersData,
      progress: progressData,
      history: historyData,
    },
  };

  const file = new File(Paths.cache, `janki-backup-${Date.now()}.json`);
  file.create({ overwrite: true });
  file.write(JSON.stringify(payload, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export quiz backup',
      UTI: 'public.json',
    });
  }

  return file.uri;
}

export async function importData() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return { imported: false as const };
  }

  const file = new File(result.assets[0].uri);
  const raw = await file.text();

  let payload: BackupPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error('Selected file is not valid JSON.');
  }

  if (!payload?.data) {
    throw new Error('Selected file is not a valid backup.');
  }

  const {
    categories: cats = [],
    subjects: subs = [],
    lessons: lsns = [],
    questions: qsns = [],
    answers: ans = [],
    questionAnswers: qas = [],
    progress: prog = [],
    history: hist = [],
  } = payload.data;

  const toDate = (value: string | number | Date | null | undefined): Date | null => {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  };

  await db.transaction(async (tx) => {
    if (cats.length) {
    await tx
      .insert(categories)
      .values(
        cats.map((c) => ({
          ...c,
          createdAt: toDate(c.createdAt)!,
          updatedAt: toDate(c.updatedAt),
          deletedAt: toDate(c.deletedAt),
        })),
      )
      .onConflictDoNothing();
    }

    if (subs.length) {
      await tx
        .insert(subjects)
        .values(
          subs.map((s) => ({
            ...s,
            createdAt: toDate(s.createdAt)!,
            updatedAt: toDate(s.updatedAt),
            deletedAt: toDate(s.deletedAt),
          })),
        )
        .onConflictDoNothing();
    }

    if (lsns.length) {
      await tx
        .insert(lessons)
        .values(
          lsns.map((l) => ({
            ...l,
            createdAt: toDate(l.createdAt)!,
            updatedAt: toDate(l.updatedAt),
            deletedAt: toDate(l.deletedAt),
          })),
        )
        .onConflictDoNothing();
    }

    if (qsns.length) {
      await tx
        .insert(questions)
        .values(
          qsns.map((q) => ({
            ...q,
            createdAt: toDate(q.createdAt)!,
            updatedAt: toDate(q.updatedAt),
            deletedAt: toDate(q.deletedAt),
          })),
        )
        .onConflictDoNothing();
    }

    if (ans.length) {
      await tx
        .insert(answers)
        .values(
          ans.map((a) => ({
            ...a,
            createdAt: toDate(a.createdAt)!,
            updatedAt: toDate(a.updatedAt),
            deletedAt: toDate(a.deletedAt),
          })),
        )
        .onConflictDoNothing();
    }

    if (qas.length) {
      await tx
        .insert(questionAnswers)
        .values(
          qas.map((qa) => ({
            ...qa,
            createdAt: toDate(qa.createdAt)!,
            updatedAt: toDate(qa.updatedAt),
            deletedAt: toDate(qa.deletedAt),
          })),
        )
        .onConflictDoNothing();
    }

    if (prog.length) {
      await tx
        .insert(progress)
        .values(
          prog.map((p) => ({
            ...p,
            lastattemptedAt: toDate(p.lastattemptedAt),
            nextattemptedAt: toDate(p.nextattemptedAt),
          })),
        )
        .onConflictDoNothing();
    }

    if (hist.length) {
      await tx
        .insert(history)
        .values(
          hist.map((h) => ({
            ...h,
            attemptedAt: toDate(h.attemptedAt)!,
          })),
        )
        .onConflictDoNothing();
    }
  });

  return {
    imported: true as const,
    counts: {
      categories: cats.length,
      subjects: subs.length,
      lessons: lsns.length,
      questions: qsns.length,
      answers: ans.length,
      questionAnswers: qas.length,
      progress: prog.length,
      history: hist.length,
    },
  };
}