'use client';
import { migrateLegacyAccount } from '@/actions/migrate-legacy-account';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useState } from 'react';
import { BiErrorCircle } from 'react-icons/bi';
import FormInput from '../FormInput/FormInput';
import SubmitButton from '../SubmitButton/SubmitButton';

interface LegacyAccountMigrateProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

const initialState = {
  message: '',
  isError: false,
};

export default function LegacyAccountMigrate({
  lang,
  dictionary,
}: LegacyAccountMigrateProps) {
  const [formResponse, setFormResponse] = useState(initialState);

  const handleAccountMigrate = async (formData: FormData) => {
    const response = await migrateLegacyAccount(lang, formData);
    setFormResponse(response);
  };

  return (
    <div className="indicator w-full">
      <span className="badge indicator-item badge-accent indicator-center text-white">
        {dictionary.pages_profile.migrate_account}
      </span>
      <form
        action={handleAccountMigrate}
        autoComplete="off"
        className="card card-body"
      >
        <div className="flex w-full flex-col">
          <p className="mb-4 max-w-2xl text-sm text-gray-500">
            {dictionary.pages_profile.legacy_migrate_info}
          </p>
          {Boolean(formResponse.isError && formResponse.message) && (
            <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
              <BiErrorCircle size={24} />
              {formResponse.message}
            </div>
          )}
          {Boolean(!formResponse.isError && formResponse.message) && (
            <div className="alert mb-4 rounded-lg bg-green-200 text-sm text-green-800">
              {formResponse.message}
            </div>
          )}
          <FormInput
            id="email"
            marginTop={false}
            placeholder={dictionary.general.username}
            title={dictionary.general.username}
            type="text"
            onChange={() => setFormResponse(initialState)}
          />
          <FormInput
            id="password"
            marginTop={false}
            placeholder={dictionary.general.password}
            title={dictionary.general.password}
            type="password"
            onChange={() => setFormResponse(initialState)}
          />
          <div>
            <SubmitButton text={dictionary.general.submit} />
          </div>
        </div>
      </form>
    </div>
  );
}
