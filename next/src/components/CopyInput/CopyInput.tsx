'use client';
import { Dictionary } from '@/models/locale';
import { useState } from 'react';
import { IoIosLink } from 'react-icons/io';

interface CopyInputProps {
  value: string;
  dictionary: Dictionary;
}

export default function CopyInput({ value, dictionary }: CopyInputProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    setCopied(true);
    navigator.clipboard.writeText(value);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <div className="join flex w-full max-w-96 max-md:max-w-full">
      <div className="join-item btn-sm flex items-center justify-center border-none bg-secondary-400 text-white">
        <IoIosLink size={28} />
      </div>
      <div className="w-full">
        <input
          className="input input-sm join-item input-bordered w-full outline-none"
          value={value}
          readOnly
        />
      </div>
      <button
        className="btn btn-primary join-item btn-sm border-none bg-secondary-400 text-white"
        onClick={copyToClipboard}
      >
        {copied ? `${dictionary.general.copied}!` : dictionary.general.copy}
      </button>
    </div>
  );
}
