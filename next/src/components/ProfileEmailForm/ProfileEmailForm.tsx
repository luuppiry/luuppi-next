'use client';
import { sendVerifyEmail } from '@/actions/send-verify-email';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { User } from '@microsoft/microsoft-graph-types';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { BiErrorCircle } from 'react-icons/bi';
import FormInput from '../FormInput/FormInput';

interface ProfileEmailResponse {
  message: string;
  isError: boolean;
  field?: string;
}

const initialState: ProfileEmailResponse = {
  message: '',
  isError: false,
  field: '',
};

interface ProfileEmailFormProps {
  user: User;
  lang: SupportedLanguage;
  dictionary: Dictionary;
}

export default function ProfileEmailform({
  user,
  lang,
  dictionary,
}: ProfileEmailFormProps) {
  const handleEmailUpdateAction = sendVerifyEmail.bind(null, lang);
  const [formResponse, setFormResponse] = useState(initialState);

  const updateEmailUpdate = async (formData: FormData) => {
    const response = await handleEmailUpdateAction(null, formData);
    setFormResponse(response);
  };

  return (
    <form action={updateEmailUpdate} className="card card-body">
      <div className="flex w-full flex-col">
        {Boolean(
          formResponse.isError && formResponse.message && !formResponse.field,
        ) && (
          <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
            <BiErrorCircle size={24} />
            {formResponse.message}
          </div>
        )}
        {Boolean(
          !formResponse.isError && formResponse.message && !formResponse.field,
        ) && (
          <div className="alert mb-4 rounded-lg bg-green-200 text-sm text-green-800">
            {formResponse.message}
          </div>
        )}
        <FormInput
          error={formResponse.field === 'email' ? formResponse.message : ''}
          id="email"
          marginTop={false}
          placeholder="webmaster@luuppi.fi"
          title={dictionary.general.email}
          type="email"
          value={user.mail as string}
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
