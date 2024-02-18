import { login } from '@/app/actions';
import { getDictionary } from '@/dictionaries';
import { useFormState } from 'react-dom';
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
      <button className="btn btn-primary text-white" type="submit">
        {dictionary.general.login}
      </button>
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
