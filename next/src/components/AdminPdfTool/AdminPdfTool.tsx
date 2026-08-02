'use client';

import { Dictionary } from '@/models/locale';
import { useState } from 'react';

export default function AdminPdfTool({
  dictionary,
}: {
  dictionary: Dictionary;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [coverRange, setCoverRange] = useState('1');
  const [contentRange, setContentRange] = useState('2-~2');
  const [backRange, setBackRange] = useState('end');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!file) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('coverRange', coverRange);
      formData.append('contentRange', contentRange);
      formData.append('backRange', backRange);

      const res = await fetch('/api/admin/process-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Processing failed.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'final_compressed.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        (err as { message?: string }).message ?? 'Something went wrong.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="my-4 flex flex-col gap-4" onSubmit={handleSubmit}>
      <input
        accept="application/pdf"
        className="file-input file-input-bordered file-input-primary w-full max-w-xs"
        type="file"
        required
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <div className="flex gap-4">
        <label>
          {dictionary.pages_admin.cover_range}
          <input
            className="input input-bordered w-full max-w-xs"
            value={coverRange}
            onChange={(e) => setCoverRange(e.target.value)}
          />
        </label>
        <label>
          {dictionary.pages_admin.content_range}
          <input
            className="input input-bordered w-full max-w-xs"
            value={contentRange}
            onChange={(e) => setContentRange(e.target.value)}
          />
        </label>
        <label>
          {dictionary.pages_admin.back_range}
          <input
            className="input input-bordered w-full max-w-xs"
            value={backRange}
            onChange={(e) => setBackRange(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <button
        className="btn btn-primary max-w-fit"
        disabled={!file || isSubmitting}
        type="submit"
      >
        {isSubmitting
          ? dictionary.pages_admin.processing
          : dictionary.pages_admin.process_pdf}
      </button>
    </form>
  );
}
