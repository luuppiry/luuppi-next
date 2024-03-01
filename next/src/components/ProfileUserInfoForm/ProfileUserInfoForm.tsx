'use client';
import { updateProfile } from '@/actions/update-profile';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { User } from '@microsoft/microsoft-graph-types';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { BiErrorCircle } from 'react-icons/bi';
import FormInput from '../FormInput/FormInput';

interface ProfileFormResponse {
  message: string;
  isError: boolean;
  field?: string;
}

const initialState: ProfileFormResponse = {
  message: '',
  isError: false,
  field: '',
};

interface ProfileUserInfoFormProps {
  user: User;
  lang: SupportedLanguage;
  dictionary: Dictionary;
}

export default function ProfileUserInfoForm({
  user,
  lang,
  dictionary,
}: ProfileUserInfoFormProps) {
  const updateProfileAction = updateProfile.bind(null, lang);
  const [formResponse, setFormResponse] = useState(initialState);

  const handleProfileUpdate = async (formData: FormData) => {
    const response = await updateProfileAction(null, formData);
    setFormResponse(response);
  };

  return (
    <form
      action={handleProfileUpdate}
      className="card card-body bg-background-50"
    >
      <div className="flex w-full flex-col">
        {Boolean(
          formResponse.isError &&
            formResponse.message &&
            formResponse.field !== '',
        ) && (
          <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
            <BiErrorCircle size={24} />
            {formResponse.message}
          </div>
        )}
        {Boolean(
          !formResponse.isError &&
            formResponse.message &&
            formResponse.field !== '',
        ) && (
          <div className="alert mb-4 rounded-lg bg-green-200 text-sm text-green-800">
            {formResponse.message}
          </div>
        )}
        <FormInput
          error={
            formResponse.field === 'displayName' ? formResponse.message : ''
          }
          id="displayName"
          marginTop={false}
          placeholder={dictionary.general.username}
          title={dictionary.general.username}
          type="text"
          value={user.displayName as string}
          onChange={() => setFormResponse(initialState)}
        />
        <FormInput
          error={formResponse.field === 'givenName' ? formResponse.message : ''}
          id="givenName"
          marginTop={false}
          placeholder={dictionary.general.firstName}
          title={dictionary.general.firstName}
          type="text"
          value={user.givenName as string}
          onChange={() => setFormResponse(initialState)}
        />
        <FormInput
          error={formResponse.field === 'surname' ? formResponse.message : ''}
          id="surname"
          marginTop={false}
          placeholder={dictionary.general.lastName}
          title={dictionary.general.lastName}
          type="text"
          value={user.surname as string}
          onChange={() => setFormResponse(initialState)}
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
