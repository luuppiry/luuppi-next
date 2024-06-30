'use client';

import { telegramGroups } from '@/libs/constants/telegram-groups';
import { Dictionary } from '@/models/locale';
import Link from 'next/link';
import { useState } from 'react';
import { BsTelegram } from 'react-icons/bs';

interface GroupsDialogProps {
  dictionary: Dictionary;
}

export default function GroupsDialog({ dictionary }: GroupsDialogProps) {
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-primary text-lg font-bold max-md:text-base"
        onClick={() => setOpen(true)}
      >
        {dictionary.pages_home.telegram.groups}
      </button>
      <dialog
        className={`modal modal-bottom sm:modal-middle ${open ? 'modal-open' : ''}`}
      >
        <div className="modal-box max-h-[calc(100dvh-6em)]">
          <h3 className="text-lg font-bold">
            {dictionary.pages_home.telegram.groups}
          </h3>
          <div className="flex flex-col py-4">
            {telegramGroups.map((group) => (
              <Link
                key={group.link}
                className={`mb-4 flex items-center gap-2 rounded-lg p-2 font-bold ${
                  group.translation === 'new_students'
                    ? 'bg-accent-400 text-white'
                    : 'bg-background-50/50'
                }`}
                href={group.link}
                target="_blank"
              >
                <BsTelegram size={24} />
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
              <button className="btn btn-sm" onClick={onClose}>
                {dictionary.general.close}
              </button>
            </form>
          </div>
        </div>
        <label className="modal-backdrop" onClick={onClose}>
          Close
        </label>
      </dialog>
    </>
  );
}
