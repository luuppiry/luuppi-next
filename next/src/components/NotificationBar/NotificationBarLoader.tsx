import NotificationBar from './NotificationBar';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponse } from '@/types/types';
import { lang } from 'next/root-params';

export async function NotificationBarLoader() {
  const language = await lang();
  const notification = await getStrapiData<
    APIResponse<'api::notification.notification'>
  >(language, '/api/notification', ['notification'], true);

  return <NotificationBar lang={language} notification={notification} />;
}
