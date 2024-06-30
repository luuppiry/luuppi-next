import { Dictionary } from '@/models/locale';

interface QuestionConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  dictionary: Dictionary;
}

export default function QuestionConfirmDialog({
  open,
  onClose,
  dictionary,
}: QuestionConfirmDialogProps) {
  return (
    <dialog
      className={`modal modal-bottom sm:modal-middle ${open ? 'modal-open' : ''}`}
    >
      <div className="modal-box max-h-[calc(100dvh-6em)]">
        <h3 className="text-lg font-bold">
          {dictionary.pages_events.unanswered_questions}
        </h3>
        <div className="flex flex-col py-4 text-sm">
          <p>{dictionary.pages_events.unanswered_questions_description}</p>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-sm" onClick={onClose}>
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
