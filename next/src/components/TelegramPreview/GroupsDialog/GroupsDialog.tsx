'use client';

import { telegramGroups } from '@/libs/constants/telegram-groups';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import Link from 'next/link';
import { useRef } from 'react';
import { BsTelegram } from 'react-icons/bs';

interface GroupsDialogProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default function GroupsDialog({ dictionary, lang }: GroupsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className="btn btn-primary text-lg font-bold max-md:text-base"
        onClick={() => dialogRef.current?.showModal()}
      >
        {dictionary.pages_home.telegram.groups}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="groups-title"
        className="modal modal-bottom sm:modal-middle [&:not([open])]:hidden"
      >
        <div className="modal-box max-h-[calc(100dvh-6em)]">
          <h3 className="text-lg font-bold" id="groups-title">
            {dictionary.pages_home.telegram.groups}
          </h3>
          <div className="flex flex-col py-4">
            {telegramGroups.map((group) => (
              <Link
                key={group.link}
                className={`mb-4 flex items-center gap-2 rounded-lg p-2 font-bold ${
                  group.translation === 'new_students'
                    ? 'bg-accent-400 text-white'
                    : 'bg-background-50'
                }`}
                href={lang === 'en' ? (group.linkEn ?? group.link) : group.link}
                rel="noopener noreferrer"
                target="_blank"
              >
                <BsTelegram size={24} aria-hidden />
                {
                  dictionary.pages_home.telegram[
                    group.translation as keyof typeof dictionary.pages_home.telegram
                  ]
                }
              </Link>
            ))}
            <p>{dictionary.pages_home.telegram.new_student_group}</p>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-sm">{dictionary.general.close}</button>
            </form>
          </div>
        </div>
        <form className="modal-backdrop" method="dialog">
          <button aria-label={dictionary.general.close}>close</button>
        </form>
      </dialog>
    </>
  );
}
