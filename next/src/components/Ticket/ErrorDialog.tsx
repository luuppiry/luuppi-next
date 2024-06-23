import { Dictionary } from '@/models/locale';

interface ErrorDialogProps {
  dictionary: Dictionary;
  open: boolean;
  onClose: () => void;
  response: {
    message: string;
    isError: boolean;
  } | null;
}

export default function ErrorDialog({
  dictionary,
  open,
  onClose,
  response,
}: ErrorDialogProps) {
  if (!response) return null;
  return (
    <dialog className={`modal ${open ? 'modal-open' : ''}`}>
      <div className="modal-box max-h-[calc(100dvh-6em)]">
        <h3 className="text-lg font-bold">
          {response.isError
            ? dictionary.general.error
            : dictionary.general.success}
        </h3>
        <div className="flex flex-col py-4 text-sm">
          <p>{response.message}</p>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={onClose}>
              {dictionary.general.close}
            </button>
          </form>
        </div>
      </div>
      <label className="modal-backdrop" onClick={onClose}>
        Close
      </label>
    </dialog>
  );
}
