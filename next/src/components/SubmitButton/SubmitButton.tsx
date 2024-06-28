'use client';
import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  text: string;
  variant?: 'primary' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: any;
}

export default function SubmitButton({
  text,
  variant = 'primary',
  size = 'sm',
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`btn-${variant} btn btn-${size} ${className}`}
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <div className="min-w-16">
          <span className="loading loading-spinner loading-md" />
        </div>
      ) : (
        text
      )}
    </button>
  );
}
