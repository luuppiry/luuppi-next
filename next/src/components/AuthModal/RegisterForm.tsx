import { register } from '@/app/actions';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import FormInput from '../FormInput/FormInput';

interface RegisterFormProps {
  login: () => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

const initialState = {
  error: {
    field: '',
    message: '',
  },
};

export default function RegisterForm({
  login,
  dictionary,
  lang,
}: RegisterFormProps) {
  const [state, formAction] = useFormState(register, initialState);

  return (
    <form action={formAction}>
      <FormInput
        error={state?.error}
        id="email"
        placeholder="webmaster@luuppi.fi"
        title={dictionary.general.email}
        type="email"
      />
      <FormInput
        error={state?.error}
        id="username"
        placeholder="Webmaster"
        title={dictionary.general.username}
      />
      <FormInput
        error={state?.error}
        id="password"
        placeholder="*********"
        title={dictionary.general.password}
        type="password"
      />
      <FormInput
        error={state?.error}
        id="confirmPassword"
        placeholder="*********"
        title={dictionary.auth.confirm_password}
        type="confirmPassword"
      />
      <div className="form-control my-4">
        <label className="label cursor-pointer">
          <Link
            className="link label-text"
            href={`/${lang}/privacy-policy`}
            target="_blank"
          >
            {dictionary.auth.accept_terms}
          </Link>
          <input
            className="checkbox-primary checkbox"
            id="termsAccepted"
            name="termsAccepted"
            type="checkbox"
            required
          />
        </label>
      </div>
      <SubmitButton dictionary={dictionary} />
      <div className="form-control mb-2 mt-4 text-sm opacity-75">
        <span className="pl-1">
          {dictionary.auth.already_have_account}{' '}
          <button className="link" type="button" onClick={login}>
            {' '}
            {dictionary.auth.login_here}
          </button>
        </span>
      </div>
    </form>
  );
}

interface SubmitButtonProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

export function SubmitButton({ dictionary }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary min-w-28 text-white" type="submit">
      {pending ? (
        <span className="loading loading-spinner loading-md" />
      ) : (
        dictionary.general.register
      )}
    </button>
  );
}
