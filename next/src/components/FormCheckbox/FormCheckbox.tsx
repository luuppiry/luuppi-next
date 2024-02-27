interface FormCheckboxProps {
  title: string;
  id: string;
  checked?: boolean;
}

export default function FormCheckbox({
  title,
  id,
  checked = true,
}: FormCheckboxProps) {
  return (
    <div className="form-control ">
      <label className="label cursor-pointer justify-start gap-4">
        <input
          className="checkbox"
          defaultChecked={checked}
          id={id}
          type="checkbox"
        />
        <span className="label-text">{title}</span>
      </label>
    </div>
  );
}
