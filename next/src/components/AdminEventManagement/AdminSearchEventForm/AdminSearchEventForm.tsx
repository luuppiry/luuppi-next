'use client';

import { Dictionary, SupportedLanguage } from '@/models/locale';
import { createRef } from 'react';
import { BiSearch } from 'react-icons/bi';
import { MdClear } from 'react-icons/md';

interface AdminSearchEventFormProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
  searchTerm?: string;
}

export function AdminSearchEventForm({
  dictionary,
  searchTerm,
}: AdminSearchEventFormProps) {
  const inputRef = createRef<HTMLInputElement>();
  const formRef = createRef<HTMLFormElement>();

  return (
    <form ref={formRef} className="join w-full sm:w-auto" method="GET">
      <div className="join-item inline-flex h-12 items-center border border-r-0 bg-secondary-400 px-3 dark:border-[var(--fallback-bc,oklch(var(--bc)/.2))] dark:bg-primary-500">
        <BiSearch className="text-white" size={20} />
      </div>

      <input name="mode" type="hidden" value="event" />
      <div className="relative flex gap-2">
        <input
          ref={inputRef}
          className="input join-item input-bordered h-12 w-full"
          defaultValue={searchTerm}
          name="search"
          placeholder={dictionary.general.search}
          type="text"
        />

        {searchTerm && (
          <button
            className="absolute bottom-0 right-2 top-0"
            type="button"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = '';
              }
              formRef.current?.submit();
            }}
          >
            <MdClear className="fill-base-content/50" />
          </button>
        )}
      </div>
    </form>
  );
}
