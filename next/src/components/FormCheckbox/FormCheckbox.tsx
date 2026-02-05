interface FormCheckboxProps {
  title: string;
  id: string;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormCheckbox({
  title,
  id,
  checked = true,
  disabled = false,
  required = false,
  onChange,
}: FormCheckboxProps) {
  return (
    <div className="form-control">
      <label className="label cursor-pointer justify-start gap-4">
        <input
          className="checkbox"
          {...(onChange ? { checked, onChange } : { defaultChecked: checked })}
          disabled={disabled}
          id={id}
          name={id}
          required={required}
          type="checkbox"
        />
        <span className="label-text">{title}</span>
      </label>
    </div>
  );
}
