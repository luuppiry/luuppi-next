interface FormCheckboxProps {
  title: string;
  id: string;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export default function FormCheckbox({
  title,
  id,
  checked = true,
  disabled = false,
  required = false,
}: FormCheckboxProps) {
  return (
    <div className="form-control">
      <label className="label cursor-pointer justify-start gap-4">
        <input
          className="checkbox"
          defaultChecked={checked}
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
