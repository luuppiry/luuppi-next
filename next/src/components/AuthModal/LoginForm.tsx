import { login } from '@/app/actions';
import { getDictionary } from '@/dictionaries';
import { useFormState, useFormStatus } from 'react-dom';
import FormInput from '../FormInput/FormInput';

interface LoginFormProps {
  register: () => void;
  forgotPassword: () => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

const initialState = {
  error: {
    field: '',
    message: '',
  },
};

export default function LoginForm({
  register,
  forgotPassword,
  dictionary,
}: LoginFormProps) {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <form action={formAction}>
      {Boolean(state?.error.message && !state.error.field) && (
        <div className="alert alert-warning mt-4" role="alert">
          <svg
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <span>{state?.error.message}</span>
        </div>
      )}
      <FormInput
        error={state?.error}
        id="email"
        placeholder="webmaster@luuppi.fi"
        title={dictionary.general.email}
        type="email"
      />
      <FormInput
        error={state?.error}
        id="password"
        labelTopRight={
          <button
            className="link text-xs opacity-75"
            type="button"
            onClick={() => forgotPassword()}
          >
            {dictionary.auth.forgot_password}
          </button>
        }
        placeholder="*********"
        title={dictionary.general.password}
        type="password"
      />

      <div className="form-control my-4">
        <label className="label cursor-pointer">
          <span className="label-text">{dictionary.auth.remember_me}</span>
          <input
            className="checkbox-primary checkbox"
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
          />
        </label>
      </div>
      <SubmitButton dictionary={dictionary} />
      <div className="form-control mb-2 mt-4 text-sm opacity-75">
        <span className="pl-1">
          {dictionary.auth.already_have_account}{' '}
          <button className="link" type="button" onClick={register}>
            {' '}
            {dictionary.auth.register_here}
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
        dictionary.general.login
      )}
    </button>
  );
}
