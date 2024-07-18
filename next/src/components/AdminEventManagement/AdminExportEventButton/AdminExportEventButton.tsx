'use client';
import { eventExport } from '@/actions/admin/event-export';
import SubmitButton from '@/components/SubmitButton/SubmitButton';
import { SupportedLanguage } from '@/models/locale';
import { BiExport } from 'react-icons/bi';

interface AdminExportEventButtonProps {
  lang: SupportedLanguage;
  eventId: number;
}

export default function AdminExportEventButton({
  lang,
  eventId,
}: AdminExportEventButtonProps) {
  const handleEventExport = async () => {
    const response = await eventExport(lang, eventId);
    if (response.data) {
      const bom = '\uFEFF';
      const blob = new Blob([bom + response.data], {
        type: 'text/csv;charset=utf-8',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event_${eventId}_export.csv`;
      a.click();
    }
  };

  return (
    <form action={handleEventExport} className="flex items-center justify-end">
      <SubmitButton className="btn btn-circle btn-ghost">
        <BiExport className="text-gray-800" size={24} />
      </SubmitButton>
    </form>
  );
}
