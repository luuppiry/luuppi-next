interface FormInputProps {
  title: string;
  id: string;
  type?: HTMLInputElement['type'];
  placeholder?: string;
  error?: {
    field: string;
    message: string;
  };
}

export default function FormInput({
  title,
  error,
  placeholder,
  id,
  type,
}: FormInputProps) {
  return (
    <label className="form-control my-4">
      <div className="label">
        <span className="label-text">{title}</span>
      </div>
      <input
        className={`input input-bordered ${
          Boolean(error?.field === id) && 'input-error'
        }`}
        id={id}
        name={id}
        placeholder={placeholder}
        type={type ?? 'text'}
        required
      />
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
