interface FormTextAreaProps {
  title: string;
  id: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  error?: string;
  marginTop?: boolean;
  marginBottom?: boolean;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  labelTopRight?: React.ReactNode;
  onChange?: () => void;
}

export default function FormTextArea({
  title,
  error,
  placeholder,
  id,
  required = true,
  labelTopRight,
  value,
  rows = 5,
  maxLength = 500,
  disabled = false,
  marginTop = true,
  marginBottom = true,
  onChange,
}: FormTextAreaProps) {
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
      <textarea
        className={`textarea textarea-bordered ${Boolean(error) && 'textarea-error'}`}
        defaultValue={value ?? ''}
        disabled={disabled}
        id={id}
        maxLength={maxLength}
        name={id}
        placeholder={placeholder}
        required={required}
        rows={rows}
        onChange={onChange}
      />
      {Boolean(error) && (
        <div className="label">
          <span className="label-text text-xs text-red-400">{error}</span>
        </div>
      )}
    </label>
  );
}
