'use client';
import { emailSendExpenseClaim } from '@/actions/email-send-expense-claim';
import { expenseLimits } from '@/libs/constants/expense-claim';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useRef, useState } from 'react';
import { BiErrorCircle } from 'react-icons/bi';
import FormInput from '../FormInput/FormInput';
import FormTextArea from '../FormTextArea/FormTextArea';
import SubmitButton from '../SubmitButton/SubmitButton';

interface ExpenseClaimResponse {
  message: string;
  isError: boolean;
  field?: string;
}

const initialState: ExpenseClaimResponse = {
  message: '',
  isError: false,
  field: '',
};

interface ExpenseClaimFormProps {
  lang: SupportedLanguage;
  dictionary: Dictionary;
}

export default function ExpenseClaimForm({
  lang,
  dictionary,
}: ExpenseClaimFormProps) {
  const t = dictionary.pages_expense_claim;
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [formResponse, setFormResponse] = useState(initialState);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [lineCount, setLineCount] = useState(1);

  const fieldError = (id: string) =>
    formResponse.field === id ? formResponse.message : '';

  const sendClaim = async (formData: FormData) => {
    formData.append('turnstileToken', turnstileToken);
    const response = await emailSendExpenseClaim(lang, formData);
    setFormResponse(response);
    turnstileRef.current?.reset();
    if (!response.isError) {
      formRef.current?.reset();
      setLineCount(1);
    }
  };

  return (
    <form ref={formRef} action={sendClaim} className="card card-body">
      <h2 className="mb-4 text-lg font-semibold">{t.form_title}</h2>
      {Boolean(
        formResponse.isError && formResponse.message && !formResponse.field,
      ) && (
        <div className="alert alert-error mb-4">
          <BiErrorCircle size={24} />
          {formResponse.message}
        </div>
      )}
      {Boolean(
        !formResponse.isError && formResponse.message && !formResponse.field,
      ) && (
        <div className="alert alert-success mb-4">{formResponse.message}</div>
      )}

      <div className="alert alert-info mb-4">{t.separate_forms_notice}</div>

      <FormInput
        error={fieldError('name')}
        id="name"
        marginTop={false}
        placeholder={t.name}
        title={t.name}
      />
      <FormInput
        error={fieldError('email')}
        id="email"
        marginTop={false}
        placeholder={t.email}
        title={t.email}
        type="email"
      />
      <FormInput
        error={fieldError('iban')}
        id="iban"
        marginTop={false}
        placeholder="FI00 0000 0000 0000 00"
        title={t.iban}
      />
      <FormInput
        error={fieldError('purpose')}
        id="purpose"
        marginTop={false}
        placeholder={t.purpose}
        title={t.purpose}
      />

      <h3 className="mb-2 mt-2 font-semibold">{t.expenses}</h3>
      {Array.from({ length: lineCount }, (_, i) => (
        <fieldset
          key={i}
          className="mb-4 rounded-lg border border-base-300 p-4"
        >
          <legend className="px-2 text-sm font-semibold">
            {t.expense} {i + 1}
          </legend>
          <FormInput
            error={fieldError(`line-${i}-date`)}
            id={`line-${i}-date`}
            marginTop={false}
            title={t.date}
            type="date"
          />
          <FormInput
            error={fieldError(`line-${i}-description`)}
            id={`line-${i}-description`}
            marginTop={false}
            placeholder={t.field_description}
            title={t.field_description}
          />
          <FormInput
            error={fieldError(`line-${i}-amount`)}
            id={`line-${i}-amount`}
            marginTop={false}
            placeholder="0,00"
            title={t.amount}
          />
        </fieldset>
      ))}
      <div className="mb-4 flex gap-2">
        <button
          className="btn btn-neutral btn-sm"
          disabled={lineCount >= expenseLimits.maxLines}
          type="button"
          onClick={() => setLineCount((n) => n + 1)}
        >
          {t.add_line}
        </button>
        {lineCount > 1 && (
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            onClick={() => setLineCount((n) => n - 1)}
          >
            {t.remove_line}
          </button>
        )}
      </div>

      <FormTextArea
        error={fieldError('notes')}
        id="notes"
        marginTop={false}
        maxLength={500}
        placeholder={t.notes}
        required={false}
        title={t.notes}
      />

      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold" htmlFor="receipts">
          {t.receipts}
        </label>
        <input
          accept="application/pdf,image/jpeg,image/png"
          className="file-input file-input-bordered w-full"
          id="receipts"
          name="receipts"
          type="file"
          multiple
          required
        />
        <p className="mt-1 text-sm">{t.receipts_help}</p>
        {fieldError('receipts') && (
          <p className="mt-1 text-sm text-error">{fieldError('receipts')}</p>
        )}
      </div>

      <Turnstile
        ref={turnstileRef}
        className="mb-4"
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setTurnstileToken}
      />
      <div>
        <SubmitButton text={t.send} />
      </div>
    </form>
  );
}
