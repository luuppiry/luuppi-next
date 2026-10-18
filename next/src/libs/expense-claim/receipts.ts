import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

const A4 = { width: 595, height: 842, margin: 20 };

// Merges PDFs and JPEG/PNG photos into one PDF. Procountor allows only one
// attachment per invoice. Note: pdf-lib ignores EXIF rotation on photos.
export async function mergeReceipts(files: File[]): Promise<Uint8Array> {
  const out = await PDFDocument.create();

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());

    if (file.type === 'application/pdf') {
      const source = await PDFDocument.load(bytes);
      const pages = await out.copyPages(source, source.getPageIndices());
      pages.forEach((page) => out.addPage(page));
      continue;
    }

    const image =
      file.type === 'image/png'
        ? await out.embedPng(bytes)
        : await out.embedJpg(bytes);
    const maxW = A4.width - A4.margin * 2;
    const maxH = A4.height - A4.margin * 2;
    const { width, height } = image.scale(
      Math.min(maxW / image.width, maxH / image.height, 1),
    );
    const page = out.addPage([A4.width, A4.height]);
    page.drawImage(image, {
      x: (A4.width - width) / 2,
      y: A4.height - A4.margin - height,
      width,
      height,
    });
  }

  return out.save();
}

export async function zipFiles(
  files: { name: string; data: Uint8Array | Buffer }[],
): Promise<Buffer> {
  const zip = new JSZip();
  files.forEach((f) => zip.file(f.name, f.data));
  return zip.generateAsync({ type: 'nodebuffer' });
}
