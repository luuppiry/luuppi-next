'use client';
import { getDictionary } from '@/dictionaries';
import { IoIosLink } from 'react-icons/io';

interface CopyInputProps {
  value: string;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

export default function CopyInput({ value, dictionary }: CopyInputProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
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
        {dictionary.general.copy}
      </button>
    </div>
  );
}
