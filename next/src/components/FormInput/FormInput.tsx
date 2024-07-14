interface FormInputProps {
  title: string;
  id: string;
  type?: HTMLInputElement['type'];
  required?: boolean;
  placeholder?: string;
  value?: string;
  error?: string;
  marginTop?: boolean;
  marginBottom?: boolean;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  labelTopRight?: React.ReactNode;
  readonly?: boolean;
  onChange?: () => void;
}

export default function FormInput({
  title,
  error,
  placeholder,
  id,
  required = true,
  labelTopRight,
  value,
  type,
  disabled = false,
  marginTop = true,
  marginBottom = true,
  minLength,
  maxLength,
  readonly,
  onChange,
}: FormInputProps) {
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
      <input
        className={`input input-bordered ${Boolean(error) && 'input-error'}`}
        defaultValue={value ?? ''}
        disabled={disabled}
        id={id}
        maxLength={maxLength}
        minLength={minLength}
        name={id}
        placeholder={placeholder}
        readOnly={readonly}
        required={required}
        type={type ?? 'text'}
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
