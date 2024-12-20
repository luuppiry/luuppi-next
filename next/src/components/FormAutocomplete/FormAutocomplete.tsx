import { useEffect, useRef, useState } from 'react';
import { BiSearch } from 'react-icons/bi';

interface FormAutocompleteProps {
  options: string[];
  title: string;
  error?: string;
  marginTop?: boolean;
  marginBottom?: boolean;
  placeholder?: string;
  noResultsText: string;
  // eslint-disable-next-line no-unused-vars
  onSelect: (value: string) => void;
  // eslint-disable-next-line no-unused-vars
  onChange?: (value: string) => void;
}

export default function FormAutocomplete({
  options,
  error,
  title,
  marginBottom = true,
  marginTop = true,
  placeholder,
  noResultsText,
  onSelect,
  onChange,
}: FormAutocompleteProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [value, setValue] = useState('');
  const ref = useRef<any>(undefined);

  const select = (option: string) => {
    setValue('');
    onSelect(option);
    setShowOptions(false);
  };

  const handleChange = (text: string) => {
    setValue(text);
    setShowOptions(true);
    onChange && onChange(text);
  };

  const filteredOptions = options.filter((option) => option.includes(value));

  useEffect(() => {
    const listener = (e: Event) => {
      if (!ref.current?.contains(e.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('click', listener);
    document.addEventListener('focusin', listener);
    return () => {
      document.removeEventListener('click', listener);
      document.removeEventListener('focusin', listener);
    };
  }, []);

  const itemHeight = 48;

  return (
    <div
      ref={ref}
      className={`relative ${marginTop && 'mt-4'} ${marginBottom && 'mb-4'}`}
    >
      <div className={`label ${!marginTop && 'pt-0'}`}>
        <span className="label-text">{title}</span>
      </div>
      <label
        className={`input input-bordered flex items-center gap-2 ${Boolean(error) && 'input-error'}`}
      >
        <BiSearch className="shrink-0" color="currentColor" size={20} />
        <input
          className={'grow'}
          placeholder={placeholder}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            setShowOptions(true);
          }}
        />
      </label>

      {showOptions && (
        <ul
          className={
            'absolute w-full cursor-pointer select-none overflow-hidden rounded-lg bg-white text-sm shadow-lg'
          }
          style={{
            maxHeight: '200px',
            bottom: `-${filteredOptions.length * itemHeight > 200 ? 200 : (filteredOptions.length || 1) * itemHeight}px`,
            overflowY: 'auto',
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option}
                className="flex h-[48px] items-center px-4 hover:bg-gray-100"
                onClick={() => select(option)}
              >
                {option}
              </li>
            ))
          ) : (
            <li className="flex h-[48px] items-center px-4">{noResultsText}</li>
          )}
        </ul>
      )}
    </div>
  );
}
