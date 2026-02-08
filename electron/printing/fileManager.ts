import fs from "fs";
import path from "path";

export function saveFile(
  fileName: string,
  buffer: ArrayBuffer
) {
  const folder = path.join(process.cwd(), "print-queue");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  const filePath = path.join(folder, fileName);

  fs.writeFileSync(filePath, Buffer.from(buffer));

  return filePath;
}

export function deleteFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
