import fs from "fs";
import path from "path";

/**
 * SECURITY: Sanitize file names to prevent path traversal attacks.
 * Removes directory separators and special characters that could escape
 * the print-queue directory (e.g., "../../../etc/passwd").
 */
function sanitizeFileName(fileName: string): string {
  // Remove any directory components (path traversal prevention)
  const baseName = path.basename(fileName);
  // Remove any remaining dangerous characters
  const sanitized = baseName.replace(/[^a-zA-Z0-9._\-\s]/g, "_");
  // Ensure the file name is not empty after sanitization
  if (!sanitized || sanitized === "." || sanitized === "..") {
    return `file_${Date.now()}`;
  }
  // Limit file name length (OWASP: prevent excessively long names)
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    return sanitized.slice(0, 255 - ext.length) + ext;
  }
  return sanitized;
}

export function saveFile(
  fileName: string,
  buffer: ArrayBuffer
) {
  // SECURITY: Sanitize the file name to prevent path traversal
  const safeName = sanitizeFileName(fileName);
  const folder = path.join(process.cwd(), "print-queue");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  const filePath = path.join(folder, safeName);

  // SECURITY: Verify the resolved path is still within print-queue
  const resolvedPath = path.resolve(filePath);
  const resolvedFolder = path.resolve(folder);
  if (!resolvedPath.startsWith(resolvedFolder + path.sep) && resolvedPath !== resolvedFolder) {
    throw new Error("Invalid file path: attempted path traversal");
  }

  fs.writeFileSync(filePath, Buffer.from(buffer));

  return filePath;
}

export function deleteFile(filePath: string) {
  // SECURITY: Verify the file is within the print-queue directory before deleting
  const folder = path.resolve(process.cwd(), "print-queue");
  const resolvedPath = path.resolve(filePath);
  
  if (!resolvedPath.startsWith(folder + path.sep) && resolvedPath !== folder) {
    throw new Error("Invalid file path: attempted path traversal");
  }

  if (fs.existsSync(resolvedPath)) {
    fs.unlinkSync(resolvedPath);
  }
}
