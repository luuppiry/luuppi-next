'use client';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { User } from '@microsoft/microsoft-graph-types';
import FormCheckbox from '../FormCheckbox/FormCheckbox';

interface ProfileNotificationsFormProps {
  user: User;
  lang: SupportedLanguage;
  dictionary: Dictionary;
}

export default function ProfileNotificationsForm({
  dictionary,
}: ProfileNotificationsFormProps) {
  return (
    <form className="card card-body">
      <div className="flex w-full flex-col">
        <FormCheckbox id="loop" title={dictionary.mail_list.loop} disabled />
      </div>
    </form>
  );
}
