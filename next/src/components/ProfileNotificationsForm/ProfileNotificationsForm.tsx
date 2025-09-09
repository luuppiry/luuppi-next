'use client';
import { Dictionary } from '@/models/locale';
import { User } from '@prisma/client';
import FormCheckbox from '../FormCheckbox/FormCheckbox';

interface ProfileNotificationsFormProps {
  user: User;
  lang: string;
  dictionary: Dictionary;
}

export default function ProfileNotificationsForm({
  dictionary,
}: ProfileNotificationsFormProps) {
  return (
    <form className="card card-body">
      <h2 className="mb-4 text-lg font-semibold">
        {dictionary.pages_profile.email_subscription}
      </h2>
      <FormCheckbox id="loop" title={dictionary.mail_list.loop} disabled />
    </form>
  );
}
