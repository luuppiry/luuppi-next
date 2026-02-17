interface FormSelectProps {
  title: string;
  id: string;
  value?: string;
  options: { value: string; label: string }[];
  required?: boolean;
  marginTop?: boolean;
  marginBottom?: boolean;
  labelTopRight?: React.ReactNode;
  disabled?: boolean;

  onChange?: (e: any) => void;
}

export default function FormSelect({
  title,
  id,
  options,
  value,
  required = true,
  marginTop = true,
  marginBottom = true,
  labelTopRight,
  disabled = false,
  onChange,
}: FormSelectProps) {
  return (
    <label
      className={`form-control ${marginTop && 'mt-4'} ${marginBottom && 'mb-4'}`}
    >
      <div className={`label ${!marginTop && 'pt-0'}`}>
        <span className="label-text">
          {title} {required && '*'}
        </span>
        {labelTopRight && (
          <span className="label-text-alt">{labelTopRight}</span>
        )}
      </div>
      <select
        className="select select-bordered w-full"
        defaultValue={value}
        disabled={disabled}
        id={id}
        name={id}
        required={required}
        onChange={onChange}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
