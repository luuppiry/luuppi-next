import { forgotPassword } from '@/app/actions';
import { getDictionary } from '@/dictionaries';
import { useFormState } from 'react-dom';
import FormInput from '../FormInput/FormInput';

interface ForgotPasswordFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  login: () => void;
}

const initialState = {
  error: {
    field: '',
    message: '',
  },
};

export default function ForgotPasswordForm({
  dictionary,
  login,
}: ForgotPasswordFormProps) {
  const [state, formAction] = useFormState(forgotPassword, initialState);

  return (
    <form action={formAction}>
      <FormInput
        error={state?.error}
        id="email"
        placeholder="webmaster@luuppi.fi"
        title={dictionary.general.email}
        type="email"
      />
      <button className="btn btn-primary mt-2 text-white" type="submit">
        {dictionary.general.submit}
      </button>
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
