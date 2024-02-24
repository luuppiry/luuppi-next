interface FormInputProps {
  title: string;
  id: string;
  type?: HTMLInputElement['type'];
  placeholder?: string;
  value?: string;
  loading?: boolean;
  error?: {
    field: string;
    message: string;
  };
  labelTopRight?: React.ReactNode;
}

export default function FormInput({
  title,
  error,
  placeholder,
  id,
  labelTopRight,
  value,
  type,
  loading,
}: FormInputProps) {
  return (
    <label className="form-control my-4">
      <div className="label">
        <span className="label-text">{title}</span>
        {labelTopRight && (
          <span className="label-text-alt">{labelTopRight}</span>
        )}
      </div>
      {loading ? (
        <div className="skeleton h-12 rounded-lg" />
      ) : (
        <input
          className={`input input-bordered ${
            Boolean(error?.field === id) && 'input-error'
          }`}
          defaultValue={value ?? ''}
          id={id}
          name={id}
          placeholder={placeholder}
          type={type ?? 'text'}
          required
        />
      )}
      {Boolean(error?.field === id) && (
        <div className="label">
          <span className="label-text text-xs text-red-400">
            {error?.field === id && error.message}
          </span>
        </div>
      )}
    </label>
  );
}
