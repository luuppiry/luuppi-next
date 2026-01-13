import { BiSearch } from 'react-icons/bi';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder,
}: SearchBarProps) {
  return (
    <div className="join w-full sm:w-auto">
      <div className="join-item inline-flex h-12 items-center border border-r-0 bg-secondary-400 px-3 dark:border-[var(--fallback-bc,oklch(var(--bc)/.2))] dark:bg-primary-500">
        <BiSearch className="text-white" size={20} />
      </div>
      <input
        className="input join-item input-bordered h-12 w-full"
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
