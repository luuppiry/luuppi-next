'use client';
import { profileUpdate } from '@/actions/profile-update';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { User } from '@prisma/client';
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
  user: User;
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
  const [formResponse, setFormResponse] = useState(initialState);

  const handleProfileUpdate = async (formData: FormData) => {
    const response = await profileUpdate(lang, formData);
    setFormResponse(response);
  };

  const hasMissingInformation =
    isLuuppiMember &&
    (!user.firstName || !user.lastName || !user.domicle || !user.major);

  return (
    <form action={handleProfileUpdate} className="card card-body">
      <h2 className="mb-4 text-lg font-semibold">
        {dictionary.general.general_info}
      </h2>
      {hasMissingInformation && (
        <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
          <BiErrorCircle size={24} />
          {dictionary.pages_profile.missing_required_fields}
        </div>
      )}
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
        error={formResponse.field === 'username' ? formResponse.message : ''}
        id="username"
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
        required={false}
        title={dictionary.general.username}
        type="text"
        value={user.username ?? ''}
        onChange={() => setFormResponse(initialState)}
      />
      <FormInput
        error={formResponse.field === 'firstName' ? formResponse.message : ''}
        id="firstName"
        labelTopRight={
          <span
            className="tooltip tooltip-left flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary-400 text-white"
            data-tip={dictionary.pages_profile.first_name_explanation}
          >
            <FaQuestion size={12} />
          </span>
        }
        marginTop={false}
        placeholder={dictionary.general.firstNames}
        required={isLuuppiMember}
        title={dictionary.general.firstNames}
        type="text"
        value={user.firstName ?? ''}
        onChange={() => setFormResponse(initialState)}
      />
      <FormInput
        error={formResponse.field === 'lastName' ? formResponse.message : ''}
        id="lastName"
        labelTopRight={
          <span
            className="tooltip tooltip-left flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary-400 text-white"
            data-tip={dictionary.pages_profile.lastname_explanation}
          >
            <FaQuestion size={12} />
          </span>
        }
        marginTop={false}
        placeholder={dictionary.general.lastName}
        required={isLuuppiMember}
        title={dictionary.general.lastName}
        type="text"
        value={user.lastName ?? ''}
        onChange={() => setFormResponse(initialState)}
      />
      <FormInput
        error={
          formResponse.field === 'preferredFullName' ? formResponse.message : ''
        }
        id="preferredFullName"
        labelTopRight={
          <span
            className="tooltip tooltip-left flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary-400 text-white"
            data-tip={dictionary.pages_profile.preferred_full_name_explanation}
          >
            <FaQuestion size={12} />
          </span>
        }
        marginTop={false}
        placeholder={dictionary.general.preferredFullName}
        required={false}
        title={dictionary.general.preferredFullName}
        type="text"
        value={user.preferredFullName ?? ''}
        onChange={() => setFormResponse(initialState)}
      />
          <FormInput
            error={formResponse.field === 'domicle' ? formResponse.message : ''}
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
            required={isLuuppiMember}
            title={dictionary.general.domicle}
            type="text"
            value={user.domicle ?? ''}
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
            options={Object.keys(dictionary.pages_profile.majors).map((m) => ({
              value: m.toUpperCase(),
              label:
                dictionary.pages_profile.majors[
                  m as keyof typeof dictionary.pages_profile.majors
                ],
            }))}
            required={true}
            title={dictionary.general.major}
            value={user.major}
            onChange={() => setFormResponse(initialState)}
          />
      <div>
        <SubmitButton text={dictionary.general.submit} />
      </div>
    </form>
  );
}
