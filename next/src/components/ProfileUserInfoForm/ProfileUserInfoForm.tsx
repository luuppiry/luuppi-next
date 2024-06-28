'use client';
import { updateProfile } from '@/actions/update-profile';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { ExtendedUser } from '@/models/user';
import { useState } from 'react';
import { BiErrorCircle } from 'react-icons/bi';
import { FaQuestion } from 'react-icons/fa';
import FormInput from '../FormInput/FormInput';
import FormSelect from '../FormSelect/FormSelect';
import SubmitButton from '../SubmitButton/SubmitButton';

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
  user: ExtendedUser;
  lang: SupportedLanguage;
  dictionary: Dictionary;
  isLuuppiMember: boolean;
}

export default function ProfileUserInfoForm({
  user,
  lang,
  dictionary,
  isLuuppiMember,
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
          labelTopRight={
            <span
              className="tooltip tooltip-left flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary-400 text-white"
              data-tip={dictionary.pages_profile.username_explanation}
            >
              <FaQuestion size={12} />
            </span>
          }
          marginTop={false}
          placeholder={dictionary.general.username}
          title={dictionary.general.username}
          type="text"
          value={user.displayName ?? ''}
          onChange={() => setFormResponse(initialState)}
        />
        <FormInput
          error={formResponse.field === 'givenName' ? formResponse.message : ''}
          id="givenName"
          labelTopRight={
            <span
              className="tooltip tooltip-left flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary-400 text-white"
              data-tip={dictionary.pages_profile.given_name_explanation}
            >
              <FaQuestion size={12} />
            </span>
          }
          marginTop={false}
          placeholder={dictionary.general.firstNames}
          required={false}
          title={dictionary.general.firstNames}
          type="text"
          value={user.givenName ?? ''}
          onChange={() => setFormResponse(initialState)}
        />
        <FormInput
          error={formResponse.field === 'surname' ? formResponse.message : ''}
          id="surname"
          labelTopRight={
            <span
              className="tooltip tooltip-left flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary-400 text-white"
              data-tip={dictionary.pages_profile.surname_explanation}
            >
              <FaQuestion size={12} />
            </span>
          }
          marginTop={false}
          placeholder={dictionary.general.lastName}
          required={false}
          title={dictionary.general.lastName}
          type="text"
          value={user.surname ?? ''}
          onChange={() => setFormResponse(initialState)}
        />
        <FormInput
          error={
            formResponse.field === 'preferredFullName'
              ? formResponse.message
              : ''
          }
          id="preferredFullName"
          labelTopRight={
            <span
              className="tooltip tooltip-left flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary-400 text-white"
              data-tip={
                dictionary.pages_profile.preferred_full_name_explanation
              }
            >
              <FaQuestion size={12} />
            </span>
          }
          marginTop={false}
          placeholder={dictionary.general.preferredFullName}
          required={false}
          title={dictionary.general.preferredFullName}
          type="text"
          value={
            user.extension_3c0a9d6308d649589e6b4e1f57006bcc_PreferredFullName ??
            ''
          }
          onChange={() => setFormResponse(initialState)}
        />
        {Boolean(isLuuppiMember) && (
          <>
            <FormInput
              error={
                formResponse.field === 'domicle' ? formResponse.message : ''
              }
              id="domicle"
              labelTopRight={
                <span
                  className="tooltip tooltip-left flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary-400 text-white"
                  data-tip={dictionary.pages_profile.domicle_explanation}
                >
                  <FaQuestion size={12} />
                </span>
              }
              marginTop={false}
              placeholder={dictionary.general.domicle}
              required={false}
              title={dictionary.general.domicle}
              type="text"
              value={
                user.extension_3c0a9d6308d649589e6b4e1f57006bcc_Domicle ?? ''
              }
              onChange={() => setFormResponse(initialState)}
            />
            <FormSelect
              id="major"
              labelTopRight={
                <span
                  className="tooltip tooltip-left flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary-400 text-white"
                  data-tip={dictionary.pages_profile.major_explanation}
                >
                  <FaQuestion size={12} />
                </span>
              }
              marginTop={false}
              options={Object.keys(dictionary.pages_profile.majors).map(
                (m) => ({
                  value: m,
                  label:
                    dictionary.pages_profile.majors[
                      m as keyof typeof dictionary.pages_profile.majors
                    ],
                }),
              )}
              required={false}
              title={dictionary.general.major}
              value={
                user.extension_3c0a9d6308d649589e6b4e1f57006bcc_Major ??
                'computer_science'
              }
              onChange={() => setFormResponse(initialState)}
            />
          </>
        )}
        <div>
          <SubmitButton text={dictionary.general.submit} />
        </div>
      </div>
    </form>
  );
}
