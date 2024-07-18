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
      // Data is csv file as a string. Download it
      const element = document.createElement('a');
      const file = new Blob([response.data], { type: 'text/csv' });
      element.href = URL.createObjectURL(file);
      element.download = `event_${eventId}.csv`;
      document.body.appendChild(element);
      element.click();
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
