'use client';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import BlockRendererClient from '../BlockRendererClient/BlockRendererClient';
import './NotificationBar.css';

interface NotificationBarProps {
  notification: APIResponse<'api::notification.notification'> | null;
  lang: SupportedLanguage;
}

export default function NotificationBar({
  notification,
  lang,
}: NotificationBarProps) {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!notification?.data?.notification) return;

    const isEmpty =
      notification?.data?.notification
        ?.map((n) =>
          n.children.map((c) => c.type === 'text' && c.text.trim()).join(''),
        )
        ?.join('')
        ?.trim() === '';

    const showUntil = notification?.data?.showUntil ?? null;
    const id = `notification-${lang}`;
    const prevUpdatedAt = new Date(localStorage.getItem(id) ?? 0);
    const updatedAt = new Date(notification?.data?.updatedAt!);
    const isShowed = prevUpdatedAt.toISOString() === updatedAt.toISOString();
    const isExpired = showUntil ? new Date(showUntil) < new Date() : false;

    if (!isShowed && !isExpired && !isEmpty) {
      setShowNotification(true);
    }
  }, [lang, notification]);

  const closeNotification = () => {
    setShowNotification(false);
    const updatedAt = notification?.data?.updatedAt!;
    const id = `notification-${lang}`;
    localStorage.setItem(id, new Date(updatedAt).toISOString());
  };

  if (!showNotification || !notification?.data) return null;

  return (
    <div className="notification-area fixed bottom-0 left-0 z-40 flex min-h-12 w-full flex-col items-center justify-center bg-accent-400 px-12 py-4 text-center text-white max-md:min-h-10 max-md:text-xs">
      <BlockRendererClient content={notification.data?.notification} />
      <div className="absolute right-0 top-0 flex h-full items-center justify-center pr-4">
        <button
          className="btn btn-circle btn-ghost btn-xs text-white"
          onClick={closeNotification}
        >
          <IoMdClose size={20} />
        </button>
      </div>
    </div>
  );
}
