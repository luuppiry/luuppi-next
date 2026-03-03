import { BiErrorCircle } from 'react-icons/bi';

interface AlertProps {
  message: string;
  type: 'error' | 'success';
}

export default function Alert({ message, type }: AlertProps) {
  const styles = type === 'error' ? 'alert-error' : 'alert-success';

  return (
    <div className={`alert mb-4 rounded-lg text-sm ${styles}`}>
      {type === 'error' && <BiErrorCircle size={24} />}
      {message}
    </div>
  );
}
