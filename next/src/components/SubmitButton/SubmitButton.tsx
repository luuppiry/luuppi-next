'use client';
import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  text?: string;
  variant?: 'primary' | 'error' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: any;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function SubmitButton({
  text,
  variant = 'primary',
  size = 'sm',
  className,
  children,
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`btn-${variant} btn btn-${size} ${className}`}
      disabled={pending || disabled}
      type="submit"
    >
      {pending ? (
        <div className="min-w-16">
          <span className="loading loading-spinner loading-md" />
        </div>
      ) : (
        <>
          {children} {text}
        </>
      )}
    </button>
  );
}
