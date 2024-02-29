'use client';
import { sendVerifyEmail } from '@/actions/send-verify-email';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { User } from '@microsoft/microsoft-graph-types';
import { useFormState, useFormStatus } from 'react-dom';
import { BiErrorCircle } from 'react-icons/bi';
import FormInput from '../FormInput/FormInput';

const initialState = {
  message: '',
  isError: false,
  field: '',
};

interface ProfileEmailFormProps {
  user: User;
  lang: SupportedLanguage;
  dictionary: Dictionary;
}

export default function ProfileEmailform({
  user,
  lang,
  dictionary,
}: ProfileEmailFormProps) {
  const handleEmailUpdate = sendVerifyEmail.bind(null, lang);
  const [state, formAction] = useFormState(handleEmailUpdate, initialState);

  return (
    <form action={formAction} className="card card-body">
      <div className="flex w-full flex-col">
        {Boolean(state.isError && state.message && !state.field) && (
          <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
            <BiErrorCircle size={24} />
            {state.message}
          </div>
        )}
        {Boolean(!state.isError && state.message && !state.field) && (
          <div className="alert mb-4 rounded-lg bg-green-200 text-sm text-green-800">
            {state.message}
          </div>
        )}
        <FormInput
          error={state.field === 'email' ? state.message : ''}
          id="email"
          marginTop={false}
          placeholder="webmaster@luuppi.fi"
          title={dictionary.general.email}
          type="email"
          value={user.mail as string}
        />
        <div>
          <SubmitButton dictionary={dictionary} />
        </div>
      </div>
    </form>
  );
}

interface SubmitButtonProps {
  dictionary: Dictionary;
}

function SubmitButton({ dictionary }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className="btn btn-primary text-white"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <div className="min-w-16">
          <span className="loading loading-spinner loading-md" />
        </div>
      ) : (
        dictionary.general.submit
      )}
    </button>
  );
}
