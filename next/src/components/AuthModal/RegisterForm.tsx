import { register } from '@/app/actions';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import Link from 'next/link';

interface RegisterFormProps {
  login: () => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

export default function RegisterForm({
  login,
  dictionary,
  lang,
}: RegisterFormProps) {
  return (
    <form action={register}>
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
          <span className="label-text">{dictionary.general.username}</span>
        </div>
        <input
          className="input input-bordered"
          id="username"
          name="username"
          placeholder="Veeti Webalainen"
          type="text"
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
      <label className="form-control my-4">
        <div className="label">
          <span className="label-text">{dictionary.auth.confirm_password}</span>
        </div>
        <input
          className="input input-bordered"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="*********"
          type="password"
          required
        />
      </label>
      <div className="form-control my-4">
        <label className="label cursor-pointer">
          <Link className="link label-text" href={`${lang}/privacy-policy`}>
            {dictionary.auth.accept_terms}
          </Link>
          <input
            className="checkbox-primary checkbox"
            id="termsAccepted"
            name="termsAccepted"
            type="checkbox"
          />
        </label>
      </div>
      <button className="btn btn-primary text-white" type="submit">
        {dictionary.general.register}
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
