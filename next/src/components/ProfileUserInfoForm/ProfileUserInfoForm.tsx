'use client';
import { updateProfile } from '@/actions/update-profile';
import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import { User } from '@microsoft/microsoft-graph-types';
import { useFormState, useFormStatus } from 'react-dom';
import { BiErrorCircle } from 'react-icons/bi';
import FormInput from '../FormInput/FormInput';

const initialState = {
  message: '',
  isError: false,
  field: '',
};

interface ProfileUserInfoFormProps {
  user: User;
  lang: SupportedLanguage;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

export default function ProfileUserInfoForm({
  user,
  lang,
  dictionary,
}: ProfileUserInfoFormProps) {
  const updateProfileAction = updateProfile.bind(null, lang);
  const [state, formAction] = useFormState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="card card-body bg-background-50">
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
          error={state.field === 'displayName' ? state.message : ''}
          id="displayName"
          marginTop={false}
          placeholder={dictionary.general.username}
          title={dictionary.general.username}
          type="text"
          value={user.displayName as string}
        />
        <FormInput
          error={state.field === 'givenName' ? state.message : ''}
          id="givenName"
          marginTop={false}
          placeholder={dictionary.general.firstName}
          title={dictionary.general.firstName}
          type="text"
          value={user.givenName as string}
        />
        <FormInput
          error={state.field === 'surname' ? state.message : ''}
          id="surname"
          marginTop={false}
          placeholder={dictionary.general.lastName}
          title={dictionary.general.lastName}
          type="text"
          value={user.surname as string}
        />
        <div>
          <SubmitButton dictionary={dictionary} />
        </div>
      </div>
    </form>
  );
}

interface SubmitButtonProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
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
