export async function processPrintQueue(queue: any[]) {
  if (!queue.length) return;

  const job = queue[0]; // FIFO

  try {
    console.log("🚀 Sending job to printer:", job);

    await window.electron.printFile({
      filePath: job.filePath,
      copies: job.copies,
      colorMode: job.colorMode,
    });

    console.log("✅ Printed successfully:", job.filePath);

    // Remove from queue
    queue.shift();

  } catch (err) {
    console.error("❌ Print failed:", err);
  }
}
