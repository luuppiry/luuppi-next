import { login } from '@/app/actions';
import { getDictionary } from '@/dictionaries';

interface LoginFormProps {
  register: () => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

export default function LoginForm({ register, dictionary }: LoginFormProps) {
  return (
    <form action={login}>
      <label className="form-control">
        <div className="label">
          <span className="label-text">{dictionary.general.email}</span>
        </div>
        <input
          className="input input-bordered"
          id="email"
          name="email"
          placeholder="webmaster@luuppi.fi"
          type="email"
          required
        />
      </label>
      <label className="form-control my-4">
        <div className="label">
          <span className="label-text">{dictionary.general.password}</span>
        </div>
        <input
          className="input input-bordered"
          id="password"
          name="password"
          placeholder="*********"
          type="password"
          required
        />
      </label>
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
