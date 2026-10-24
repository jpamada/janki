import { BACKUP_EXTENSION, BACKUP_SECRET, CURRENT_PAYLOAD_VERSION, FORMAT_VERSION, HEADER_LENGTH, IV_LENGTH, KDF_ITERATIONS, LEGACY_BACKUP_SECRETS, LEGACY_FORMAT_VERSION, MAGIC, MAX_BACKUP_BYTES, MAX_LEGACY_ITERATIONS, MAX_ROWS_PER_TABLE, SALT_LENGTH, TAG_LENGTH } from '@/constants/backupConsts';
import { AESEncryptionKey, AESSealedData, CryptoDigestAlgorithm, aesDecryptAsync, aesEncryptAsync, digest, getRandomBytes } from 'expo-crypto';
import { categories, subjects, lessons, questions, answers, questionAnswers, progress, history } from './schema';
import { File, Paths } from 'expo-file-system';
import { inArray, sql } from 'drizzle-orm';
import { db } from './client';

import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

type BackupPayload = {
  version: number;
  exportedAt: string;
  data: {
    lessons: (typeof lessons.$inferSelect)[];
    answers: (typeof answers.$inferSelect)[];
    history: (typeof history.$inferSelect)[];
    subjects: (typeof subjects.$inferSelect)[];
    progress: (typeof progress.$inferSelect)[];
    questions: (typeof questions.$inferSelect)[];
    categories: (typeof categories.$inferSelect)[];
    questionAnswers: (typeof questionAnswers.$inferSelect)[];
  };
};

function concat(...parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

async function sha256(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await digest(CryptoDigestAlgorithm.SHA256, data));
}

async function deriveKey(
  secret: string,
  salt: Uint8Array,
  iterations: number,
) {
  const seed = concat(
    salt,
    new TextEncoder().encode(secret),
  );

  let block = await sha256(seed);

  for (let i = 1; i < iterations; i++) {
    block = await sha256(concat(block, seed));
  }

  return AESEncryptionKey.import(block);
}

async function encryptBackup(
  plaintext: Uint8Array
): Promise<Uint8Array> {
  const salt = getRandomBytes(SALT_LENGTH);

  const header = new Uint8Array(HEADER_LENGTH);
  header.set(MAGIC, 0);
  header[5] = FORMAT_VERSION;

  new DataView(header.buffer).setUint32(
    6,
    KDF_ITERATIONS,
  );
  header.set(salt, 10);

  const key = await deriveKey(
    BACKUP_SECRET,
    salt,
    KDF_ITERATIONS,
  );

  const sealed = await aesEncryptAsync(plaintext, key, {
    additionalData: header,
    nonce: { length: IV_LENGTH },
  });

  const combined = (await sealed.combined("bytes")) as Uint8Array;

  return concat(header, combined);
}

async function decryptBackup(
  bytes: Uint8Array,
): Promise<Uint8Array> {
  if (bytes.length < HEADER_LENGTH + IV_LENGTH + TAG_LENGTH) {
    throw new Error("Backup file is truncated or corrupted.");
  }

  const header = bytes.slice(0, HEADER_LENGTH);

  if (!MAGIC.every((b, i) => header[i] === b)) {
    throw new Error("Invalid Janki backup file.");
  }

  const formatVersion = header[5];

  if (
    formatVersion !== LEGACY_FORMAT_VERSION &&
    formatVersion !== FORMAT_VERSION
  ) {
    throw new Error("This backup uses an unsupported format version.");
  }

  const iterations = new DataView(
    header.buffer,
    header.byteOffset,
    header.byteLength,
  ).getUint32(6);

  if (
    formatVersion === LEGACY_FORMAT_VERSION &&
    (iterations < 1 || iterations > MAX_LEGACY_ITERATIONS)
  ) {
    throw new Error("Backup file has invalid encryption parameters.");
  }

  if (
    formatVersion === FORMAT_VERSION &&
    iterations !== KDF_ITERATIONS
  ) {
    throw new Error("Backup file has invalid encryption parameters.");
  }

  const salt = header.slice(10, 10 + SALT_LENGTH);

  let sealed: AESSealedData;

  try {
    sealed = AESSealedData.fromCombined(
      bytes.slice(HEADER_LENGTH),
      {
        ivLength: IV_LENGTH,
        tagLength: TAG_LENGTH,
      },
    );
  } catch {
    throw new Error("Backup file is damaged or invalid.");
  }

  const secrets: readonly string[] =
    formatVersion === LEGACY_FORMAT_VERSION
      ? LEGACY_BACKUP_SECRETS
      : [BACKUP_SECRET];

  for (const secret of secrets) {
    const key = await deriveKey(secret, salt, iterations);

    try {
      return (await aesDecryptAsync(sealed, key, {
        additionalData: header,
        output: "bytes",
      })) as Uint8Array;
    } catch {
    }
  }

  throw new Error(
    "Unable to decrypt the backup. It may be damaged, incompatible, or encrypted with another key.",
  );
}

function isJankiFile(bytes: Uint8Array) {
  return bytes.length >= MAGIC.length && MAGIC.every((b, i) => bytes[i] === b);
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function assertString(
  value: unknown,
  label: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid backup: ${label} must be a non-empty string.`);
  }
}

function assertNullableString(
  value: unknown,
  label: string,
): void {
  if (value !== null && value !== undefined && typeof value !== "string") {
    throw new Error(`Invalid backup: ${label} must be a string or null.`);
  }
}

function assertInteger(
  value: unknown,
  label: string,
): void {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    throw new Error(`Invalid backup: ${label} must be an integer.`);
  }
}

function assertNullableNumber(
  value: unknown,
  label: string,
): void {
  if (
    value !== null &&
    value !== undefined &&
    (typeof value !== "number" || !Number.isFinite(value))
  ) {
    throw new Error(`Invalid backup: ${label} must be a number or null.`);
  }
}

function assertBoolean(
  value: unknown,
  label: string,
): void {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid backup: ${label} must be a boolean.`);
  }
}

function assertDateValue(
  value: unknown,
  label: string,
  nullable = false,
): void {
  if (nullable && (value === null || value === undefined)) {
    return;
  }

  const validType =
    typeof value === "string" ||
    typeof value === "number" ||
    value instanceof Date;

  if (!validType) {
    throw new Error(`Invalid backup: ${label} is not a valid date.`);
  }

  const date =
    value instanceof Date ? value : new Date(value);

  if (!Number.isFinite(date.getTime())) {
    throw new Error(`Invalid backup: ${label} is not a valid date.`);
  }
}

function assertEnum(
  value: unknown,
  allowed: readonly string[],
  label: string,
  nullable = false,
): void {
  if (nullable && (value === null || value === undefined)) {
    return;
  }

  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new Error(`Invalid backup: ${label} has an unsupported value.`);
  }
}

function validateRows<T>(
  value: unknown,
  tableName: string,
  validateRow: (row: UnknownRecord, index: number) => void,
): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid backup: ${tableName} must be an array.`);
  }

  if (value.length > MAX_ROWS_PER_TABLE) {
    throw new Error(`Invalid backup: too many ${tableName} records.`);
  }

  const ids = new Set<string>();

  for (const [index, item] of value.entries()) {
    if (!isRecord(item)) {
      throw new Error(
        `Invalid backup: ${tableName}[${index}] must be an object.`,
      );
    }

    assertString(item.id, `${tableName}[${index}].id`);

    if (ids.has(item.id)) {
      throw new Error(
        `Invalid backup: duplicate ID in ${tableName}.`,
      );
    }

    ids.add(item.id);
    validateRow(item, index);
  }

  return value as T[];
}

function parsePayload(text: string): BackupPayload {
  let raw: unknown;

  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("Selected file is not a valid Janki backup.");
  }

  if (!isRecord(raw)) {
    throw new Error("Invalid backup: payload must be an object.");
  }

  if (
    typeof raw.version !== "number" ||
    !Number.isInteger(raw.version)
  ) {
    throw new Error("Invalid backup: missing payload version.");
  }

  if (raw.version > CURRENT_PAYLOAD_VERSION) {
    throw new Error(
      "This backup was created by a newer version of Janki. Please update the app.",
    );
  }

  if (raw.version !== CURRENT_PAYLOAD_VERSION) {
    throw new Error(
      `Unsupported backup payload version: ${raw.version}.`,
    );
  }

  assertString(raw.exportedAt, "exportedAt");
  assertDateValue(raw.exportedAt, "exportedAt");

  if (!isRecord(raw.data)) {
    throw new Error("Invalid backup: missing data object.");
  }

  const d = raw.data;

  const cats = validateRows<
    BackupPayload["data"]["categories"][number]
  >(d.categories, "categories", (r, i) => {
    assertString(r.name, `categories[${i}].name`);
    assertInteger(r.position, `categories[${i}].position`);
    assertDateValue(r.createdAt, `categories[${i}].createdAt`);
    assertDateValue(r.updatedAt, `categories[${i}].updatedAt`, true);
    assertDateValue(r.deletedAt, `categories[${i}].deletedAt`, true);
  });

  const subs = validateRows<
    BackupPayload["data"]["subjects"][number]
  >(d.subjects, "subjects", (r, i) => {
    assertString(r.name, `subjects[${i}].name`);
    assertNullableString(r.categoryId, `subjects[${i}].categoryId`);
    assertDateValue(r.createdAt, `subjects[${i}].createdAt`);
    assertDateValue(r.updatedAt, `subjects[${i}].updatedAt`, true);
    assertDateValue(r.deletedAt, `subjects[${i}].deletedAt`, true);
  });

  const lsns = validateRows<
    BackupPayload["data"]["lessons"][number]
  >(d.lessons, "lessons", (r, i) => {
    assertString(r.subjectId, `lessons[${i}].subjectId`);
    assertString(r.name, `lessons[${i}].name`);
    assertInteger(r.position, `lessons[${i}].position`);
    assertBoolean(r.favorite, `lessons[${i}].favorite`);
    assertDateValue(r.createdAt, `lessons[${i}].createdAt`);
    assertDateValue(r.updatedAt, `lessons[${i}].updatedAt`, true);
    assertDateValue(r.deletedAt, `lessons[${i}].deletedAt`, true);
  });

  const qs = validateRows<
    BackupPayload["data"]["questions"][number]
  >(d.questions, "questions", (r, i) => {
    assertString(r.lessonId, `questions[${i}].lessonId`);
    assertString(r.question, `questions[${i}].question`);
    assertEnum(
      r.type,
      ["multiple_choice", "identification"],
      `questions[${i}].type`,
    );
    assertNullableString(r.explanation, `questions[${i}].explanation`);
    assertNullableString(r.image, `questions[${i}].image`);
    assertNullableString(r.code, `questions[${i}].code`);
    assertNullableString(r.language, `questions[${i}].language`);
    assertDateValue(r.createdAt, `questions[${i}].createdAt`);
    assertDateValue(r.updatedAt, `questions[${i}].updatedAt`, true);
    assertDateValue(r.deletedAt, `questions[${i}].deletedAt`, true);
  });

  const ans = validateRows<
    BackupPayload["data"]["answers"][number]
  >(d.answers, "answers", (r, i) => {
    assertString(r.lessonId, `answers[${i}].lessonId`);
    assertString(r.answer, `answers[${i}].answer`);
    assertDateValue(r.createdAt, `answers[${i}].createdAt`);
    assertDateValue(r.updatedAt, `answers[${i}].updatedAt`, true);
    assertDateValue(r.deletedAt, `answers[${i}].deletedAt`, true);
  });

  const qas = validateRows<
    BackupPayload["data"]["questionAnswers"][number]
  >(d.questionAnswers, "questionAnswers", (r, i) => {
    assertString(r.questionId, `questionAnswers[${i}].questionId`);
    assertString(r.answerId, `questionAnswers[${i}].answerId`);
    assertBoolean(r.isCorrect, `questionAnswers[${i}].isCorrect`);
    assertDateValue(r.createdAt, `questionAnswers[${i}].createdAt`);
    assertDateValue(r.updatedAt, `questionAnswers[${i}].updatedAt`, true);
    assertDateValue(r.deletedAt, `questionAnswers[${i}].deletedAt`, true);
  });

  const prog = validateRows<
    BackupPayload["data"]["progress"][number]
  >(d.progress, "progress", (r, i) => {
    assertString(r.questionId, `progress[${i}].questionId`);
    assertEnum(
      r.reviewInterval,
      ["1_day", "3_days", "7_days"],
      `progress[${i}].reviewInterval`,
      true,
    );
    assertDateValue(r.lastattemptedAt, `progress[${i}].lastattemptedAt`, true);
    assertDateValue(r.nextattemptedAt, `progress[${i}].nextattemptedAt`, true);
  });

  const hist = validateRows<
    BackupPayload["data"]["history"][number]
  >(d.history, "history", (r, i) => {
    assertString(r.questionId, `history[${i}].questionId`);
    assertNullableString(r.answer, `history[${i}].answer`);
    assertNullableNumber(r.responseTime, `history[${i}].responseTime`);
    assertDateValue(r.attemptedAt, `history[${i}].attemptedAt`);
    assertEnum(r.status, ["correct", "incorrect"], `history[${i}].status`);
  });

  const progressQuestionIds = new Set<string>();

  for (const row of prog) {
    if (progressQuestionIds.has(row.questionId)) {
      throw new Error("Invalid backup: duplicate progress for a question.");
    }

    progressQuestionIds.add(row.questionId);
  }

  const questionAnswerPairs = new Set<string>();

  for (const row of qas) {
    const pair = JSON.stringify([row.questionId, row.answerId]);

    if (questionAnswerPairs.has(pair)) {
      throw new Error("Invalid backup: duplicate question-answer pair.");
    }

    questionAnswerPairs.add(pair);
  }

  return {
    version: CURRENT_PAYLOAD_VERSION,
    exportedAt: raw.exportedAt as string,
    data: {
      categories: cats,
      subjects: subs,
      lessons: lsns,
      questions: qs,
      answers: ans,
      questionAnswers: qas,
      progress: prog,
      history: hist,
    },
  };
}

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
    version: CURRENT_PAYLOAD_VERSION,
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

    const plaintext = new TextEncoder().encode(
    JSON.stringify(payload)
  );

  const encrypted = await encryptBackup(plaintext);

  const file = new File(
    Paths.cache,
    `janki-backup-${Date.now()}.${BACKUP_EXTENSION}`
  );

  file.create({ overwrite: true });
  file.write(encrypted);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/octet-stream",
      dialogTitle: "Export quiz backup",
      UTI: "public.data",
    });
  }

  return file.uri;
}

export async function importData() {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return { imported: false as const };
  }

  const file = new File(result.assets[0].uri);
  let bytes: Uint8Array;

  try {
    if (file.size != null && file.size > MAX_BACKUP_BYTES) {
      throw new Error(
        "Backup file is too large to import.",
      );
    }

    bytes = await file.bytes();
  } finally {
    try {
      file.delete();
    } catch {
    }
  }

  let payload: BackupPayload;

  if (isJankiFile(bytes)) {
    const plaintext = await decryptBackup(bytes);
    payload = parsePayload(new TextDecoder().decode(plaintext));
  } else {
    payload = parsePayload(new TextDecoder().decode(bytes));
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

  const toDate = (
    value: string | number | Date | null | undefined,
  ): Date | null => {
    if (value === null || value === undefined) {
      return null;
    }

    const date = value instanceof Date
      ? value
      : new Date(value);

    if (!Number.isFinite(date.getTime())) {
      throw new Error("Backup contains an invalid date.");
    }

    return date;
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
        .onConflictDoUpdate({
          target: categories.id,
          set: {
            name: sql`excluded.name`,
            position: sql`excluded.position`,
            createdAt: sql`excluded.created_at`,
            updatedAt: sql`excluded.updated_at`,
            deletedAt: sql`excluded.deleted_at`,
          },
        });
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
        .onConflictDoUpdate({
          target: subjects.id,
          set: {
            name: sql`excluded.name`,
            categoryId: sql`excluded.category_id`,
            createdAt: sql`excluded.created_at`,
            updatedAt: sql`excluded.updated_at`,
            deletedAt: sql`excluded.deleted_at`,
          },
        });
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
        .onConflictDoUpdate({
          target: lessons.id,
          set: {
            name: sql`excluded.name`,
            position: sql`excluded.position`,
            favorite: sql`excluded.favorite`,
            subjectId: sql`excluded.subject_id`,
            createdAt: sql`excluded.created_at`,
            updatedAt: sql`excluded.updated_at`,
            deletedAt: sql`excluded.deleted_at`,
          },
        });
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
        .onConflictDoUpdate({
          target: questions.id,
          set: {
            code: sql`excluded.code`,
            type: sql`excluded.type`,
            image: sql`excluded.image`,
            question: sql`excluded.question`,
            language: sql`excluded.language`,
            lessonId: sql`excluded.lesson_id`,
            createdAt: sql`excluded.created_at`,
            updatedAt: sql`excluded.updated_at`,
            deletedAt: sql`excluded.deleted_at`,
            explanation: sql`excluded.explanation`,
          },
        });
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
        .onConflictDoUpdate({
          target: answers.id,
          set: {
            answer: sql`excluded.answer`,
            lessonId: sql`excluded.lesson_id`,
            createdAt: sql`excluded.created_at`,
            updatedAt: sql`excluded.updated_at`,
            deletedAt: sql`excluded.deleted_at`,
          },
        });
    }

    if (qas.length) {
      await tx.delete(questionAnswers).where(
        inArray(
          questionAnswers.id,
          qas.map((row) => row.id),
        ),
      );

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
        .onConflictDoUpdate({
          target: [
            questionAnswers.questionId,
            questionAnswers.answerId,
          ],
          set: {
            isCorrect: sql`excluded.is_correct`,
            createdAt: sql`excluded.created_at`,
            updatedAt: sql`excluded.updated_at`,
            deletedAt: sql`excluded.deleted_at`,
          },
        });
    }

    if (prog.length) {
      await tx.delete(progress).where(
        inArray(
          progress.id,
          prog.map((row) => row.id),
        ),
      );

      await tx
        .insert(progress)
        .values(
          prog.map((p) => ({
            ...p,
            lastattemptedAt: toDate(p.lastattemptedAt),
            nextattemptedAt: toDate(p.nextattemptedAt),
          })),
        )
        .onConflictDoUpdate({
          target: progress.questionId,
          set: {
            reviewInterval: sql`excluded.review_interval`,
            lastattemptedAt: sql`excluded.last_attempt_date`,
            nextattemptedAt: sql`excluded.next_attempt_date`,
          },
        });
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
        .onConflictDoUpdate({
          target: history.id,
          set: {
            answer: sql`excluded.answer`,
            status: sql`excluded.status`,
            questionId: sql`excluded.question_id`,
            attemptedAt: sql`excluded.attemptedAt`,
            responseTime: sql`excluded.response_time`,
          },
        });
    }
  });

  return {
    imported: true as const,
    counts: {
      answers: ans.length,
      lessons: lsns.length,
      history: hist.length,
      progress: prog.length,
      subjects: subs.length,
      questions: qsns.length,
      categories: cats.length,
      questionAnswers: qas.length,
    },
  };
}