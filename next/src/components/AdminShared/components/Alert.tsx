import { BiErrorCircle } from 'react-icons/bi';

interface AlertProps {
  message: string;
  type: 'error' | 'success';
}

export default function Alert({ message, type }: AlertProps) {
  const styles =
    type === 'error'
      ? 'bg-red-200 text-red-800'
      : 'bg-green-200 text-green-800';

  return (
    <div className={`alert mb-4 rounded-lg text-sm ${styles}`}>
      {type === 'error' && <BiErrorCircle size={24} />}
      {message}
    </div>
  );
}
