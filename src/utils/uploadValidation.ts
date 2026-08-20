export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

export const ALLOWED_DOC_TYPES = new Set([
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
]);

export const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'pdf']);

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};

// Base64 prefixes of the first few magic bytes for supported types.
const MAGIC_PREFIX: Record<string, string> = {
  'image/jpeg': '/9j/',
  'image/png': 'iVBORw0KGgo',
  'application/pdf': 'JVBERi',
};

export interface UploadFileInfo {
  name?: string | null;
  type?: string | null;
  size?: number | null;
}

export interface FileValidationResult {
  valid: boolean;
  reason?: string;
}

export function getFileExtension(name?: string | null): string {
  if (!name) {
    return '';
  }
  const base = name.replace(/^.*[\\/]/, '');
  const idx = base.lastIndexOf('.');
  if (idx <= 0 || idx === base.length - 1) {
    return '';
  }
  return base.slice(idx + 1).toLowerCase();
}

function stripDataUriPrefix(data: string): string {
  const comma = data.indexOf(',');
  return comma >= 0 ? data.slice(comma + 1) : data;
}

export function matchesMagicBytes(data: string, mime?: string | null): boolean {
  const prefix = mime ? MAGIC_PREFIX[mime] : undefined;
  if (!prefix) {
    return false;
  }
  const raw = stripDataUriPrefix(data);
  return raw.startsWith(prefix);
}

export function validateFile(
  file: UploadFileInfo,
  options: {allowPdf?: boolean; base64Data?: string} = {},
): FileValidationResult {
  const allowedTypes = options.allowPdf
    ? ALLOWED_DOC_TYPES
    : ALLOWED_IMAGE_TYPES;
  const type = (file.type || '').toLowerCase();
  const name = file.name || '';

  if (file.size != null && file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      reason: `File exceeds ${Math.floor(MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB limit`,
    };
  }

  if (!allowedTypes.has(type)) {
    return {
      valid: false,
      reason: `File type "${type || 'unknown'}" is not allowed`,
    };
  }

  const ext = getFileExtension(name);
  if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
    return {valid: false, reason: `Extension ".${ext}" is not allowed`};
  }
  if (ext && EXTENSION_BY_MIME[type] && ext !== EXTENSION_BY_MIME[type]) {
    return {valid: false, reason: `Extension ".${ext}" does not match file type`};
  }

  if (options.base64Data && !matchesMagicBytes(options.base64Data, type)) {
    return {valid: false, reason: 'File content does not match its declared type'};
  }

  return {valid: true};
}
