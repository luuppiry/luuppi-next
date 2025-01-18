import { Dictionary } from '@/models/locale';
import FormSelect from '../FormSelect/FormSelect';
import SubmitButton from '../SubmitButton/SubmitButton';

interface TicketAmountDialogProps {
  dictionary: Dictionary;
  maxAmount: number;
  loading: boolean;
  open: boolean;
  onClose: () => void;
  amount: number;
  // eslint-disable-next-line no-unused-vars
  setAmount: (amount: number) => void;
  // eslint-disable-next-line no-unused-vars
  submit: (e: any) => void;
}

export default function TicketAmountDialog({
  dictionary,
  maxAmount,
  open,
  onClose,
  amount,
  setAmount,
  submit,
}: TicketAmountDialogProps) {
  return (
    <dialog
      className={`modal modal-bottom sm:modal-middle ${open ? 'modal-open' : ''}`}
    >
      <form action={submit} className="modal-box max-h-[calc(100dvh-6em)]">
        <FormSelect
          id="amount"
          marginTop={false}
          options={Array.from({ length: maxAmount }, (_, i) => i + 1).map(
            (i) => ({
              value: i.toString(),
              label: i.toString(),
            }),
          )}
          required={true}
          title={dictionary.pages_events.ticket_amount}
          value={amount.toString()}
          onChange={(e) => setAmount(parseInt(e.target.value))}
        />
        <SubmitButton text={dictionary.general.submit} variant="secondary" />
      </form>
      <label className="modal-backdrop" onClick={onClose}>
        Close
      </label>
    </dialog>
  );
}
