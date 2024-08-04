'use client';
import { eventExport } from '@/actions/admin/event-export';
import SubmitButton from '@/components/SubmitButton/SubmitButton';
import { csvToHtml } from '@/libs/utils/csv-to-html';
import { SupportedLanguage } from '@/models/locale';
import { PiFileCsv, PiFileHtml } from 'react-icons/pi';

interface AdminExportEventButtonProps {
  lang: SupportedLanguage;
  eventId: number;
}

export default function AdminExportEventButton({
  lang,
  eventId,
}: AdminExportEventButtonProps) {
  const handleEventExport = async (type: 'csv' | 'html') => {
    const response = await eventExport(lang, eventId);
    if (response.data) {
      const bom = '\uFEFF';
      if (type === 'csv') {
        const blob = new Blob([bom + response.data], {
          type: 'text/csv;charset=utf-8',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event_${eventId}_export.csv`;
        a.click();
      } else {
        const html = csvToHtml(response.data);

        const blob = new Blob([bom + html], {
          type: 'text/html;charset=utf-8',
        });

        const url = URL.createObjectURL(blob);
        window.open(url);
      }
    }
  };

  return (
    <div className="flex items-end justify-end gap-1">
      <form
        action={() => handleEventExport('html')}
        className="flex items-center justify-end"
      >
        <SubmitButton className="btn btn-circle btn-ghost">
          <PiFileHtml className="text-gray-800" size={26} />
        </SubmitButton>
      </form>
      <form
        action={() => handleEventExport('csv')}
        className="flex items-center justify-end"
      >
        <SubmitButton className="btn btn-circle btn-ghost">
          <PiFileCsv className="text-gray-800" size={26} />
        </SubmitButton>
      </form>
    </div>
  );
}
