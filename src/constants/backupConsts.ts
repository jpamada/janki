export const BACKUP_EXTENSION = 'janki';

export const MAGIC = new Uint8Array([0x4a, 0x41, 0x4e, 0x4b, 0x49]);

export const FORMAT_VERSION = 2;
export const LEGACY_FORMAT_VERSION = 1;

export const IV_LENGTH = 12;
export const TAG_LENGTH = 16;
export const SALT_LENGTH = 16;
export const HEADER_LENGTH = MAGIC.length + 1 + 4 + SALT_LENGTH;

export const KDF_ITERATIONS = 1;
export const MAX_LEGACY_ITERATIONS = 50_000;

export const CURRENT_PAYLOAD_VERSION = 3;
export const MAX_ROWS_PER_TABLE = 250_000;
export const MAX_BACKUP_BYTES = 100 * 1024 * 1024;

export const BACKUP_SECRET =
  'janki-backup-key-a81e9e4e3ee12d885ad884332987d5f9';
export const LEGACY_BACKUP_SECRETS = [] as const;
