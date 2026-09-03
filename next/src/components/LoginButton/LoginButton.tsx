'use client';

import { Dictionary } from '@/models/locale';
import { signIn, type SignInOptions } from '@/actions/auth';
import { RiLoginCircleLine } from 'react-icons/ri';

export function LoginButton({
  dictionary,
  options,
}: {
  dictionary: Dictionary;
  options?: SignInOptions;
}) {
  return (
    <form action={signIn.bind(null, options)}>
      <button
        className={
          'btn btn-primary btn-sm flex items-center rounded-lg transition-all max-xl:text-base'
        }
        type="submit"
      >
        {dictionary.general.login}
        <RiLoginCircleLine className="ml-2 inline-block" size={24} />
      </button>
    </form>
  );
}
