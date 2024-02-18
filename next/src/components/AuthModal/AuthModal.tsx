import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import ForgotPasswordForm from './ForgotPasswordForm';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: SupportedLanguage;
}

export default function AuthModal({
  open,
  onClose,
  dictionary,
  lang,
}: AuthModalProps) {
  const [type, setType] = useState<'login' | 'register' | 'forgotPassword'>(
    'login',
  );

  return (
    <dialog
      className={`modal modal-bottom sm:modal-middle ${open && 'modal-open'}`}
      id="authModal"
    >
      <div className="modal-box">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {type === 'login'
              ? dictionary.auth.login_to_account
              : type === 'register'
                ? dictionary.auth.register_account
                : dictionary.auth.reset_password}
          </h3>
          <button className="btn btn-circle btn-ghost btn-sm">
            <IoMdClose onClick={onClose} />
          </button>
        </div>
        {type === 'login' ? (
          <LoginForm
            dictionary={dictionary}
            forgotPassword={() => setType('forgotPassword')}
            register={() => setType('register')}
          />
        ) : type === 'register' ? (
          <RegisterForm
            dictionary={dictionary}
            lang={lang}
            login={() => setType('login')}
          />
        ) : (
          <ForgotPasswordForm
            dictionary={dictionary}
            login={() => setType('login')}
          />
        )}
      </div>
      <form className="modal-backdrop" method="dialog">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
