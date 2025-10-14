'use client';
import { addressDeclaration } from '@/actions/address-declaration';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { User } from '@prisma/client';
import { useState } from 'react';
import { BiErrorCircle } from 'react-icons/bi';
import { FaQuestion } from 'react-icons/fa';
import FormCheckbox from '../FormCheckbox/FormCheckbox';
import FormInput from '../FormInput/FormInput';
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

interface ProfileUserAddressDeclarationProps {
  declared: boolean;
  user: User;
  lang: SupportedLanguage;
  dictionary: Dictionary;
  isLuuppiMember: boolean;
}

export default function ProfileUserAddressDeclaration({
  declared,
  user,
  lang,
  dictionary,
  isLuuppiMember,
}: ProfileUserAddressDeclarationProps) {
  const [formResponse, setFormResponse] = useState(initialState);

  const handleProfileUpdate = async (formData: FormData) => {
    const response = await addressDeclaration(lang, formData);
    setFormResponse(response);
  };

  const hasMissingInformation =
    isLuuppiMember &&
    (!user.streetAddress || !user.postalCode || !user.domicle || !user.country);

  const declarationYear = getDeclarationYear();

  // Only allow editing checkbox between 1.9 and 30.11
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const isDeclarationPeriod =
    (month === 9 && day >= 1) ||
    (month > 9 && month < 11) ||
    (month === 11 && day <= 30);

  return (
    <form action={handleProfileUpdate} className="card card-body">
      <h2 className="mb-4 text-lg font-semibold">
        {dictionary.general.address_declaration} {declarationYear}-
        {declarationYear + 1}
      </h2>
      {hasMissingInformation && (
        <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
          <BiErrorCircle size={24} />
          {dictionary.pages_profile.missing_required_fields}
        </div>
      )}
      {!declared && (
        <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
          <BiErrorCircle size={24} />
          {dictionary.pages_profile.address_not_declared} {declarationYear}-
          {declarationYear + 1}.
        </div>
      )}
      {declared && (
        <div className="alert mb-4 rounded-lg bg-green-200 text-sm text-green-800">
          <BiErrorCircle size={24} />
          {dictionary.pages_profile.address_declarated_info} {declarationYear}-
          {declarationYear + 1}.
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
        disabled={!isDeclarationPeriod}
        error={
          formResponse.field === 'streetAddress' ? formResponse.message : ''
        }
        id="streetAddress"
        labelTopRight={
          <span
            className="tooltip tooltip-left flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary-400 text-white"
            data-tip={dictionary.pages_profile.street_address_explanation}
          >
            <FaQuestion size={12} />
          </span>
        }
        marginTop={false}
        placeholder={dictionary.general.street_address}
        required={true}
        title={dictionary.general.street_address}
        type="text"
        value={user.streetAddress ?? ''}
        onChange={() => setFormResponse(initialState)}
      />
      <FormInput
        disabled={!isDeclarationPeriod}
        error={formResponse.field === 'postalCode' ? formResponse.message : ''}
        id="postalCode"
        labelTopRight={
          <span
            className="tooltip tooltip-left flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary-400 text-white"
            data-tip={dictionary.pages_profile.postal_code_explanation}
          >
            <FaQuestion size={12} />
          </span>
        }
        marginTop={false}
        placeholder={dictionary.general.postal_code}
        required={isLuuppiMember}
        title={dictionary.general.postal_code}
        type="text"
        value={user.postalCode ?? ''}
        onChange={() => setFormResponse(initialState)}
      />
      <FormInput
        disabled={!isDeclarationPeriod}
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
      <FormInput
        disabled={!isDeclarationPeriod}
        error={formResponse.field === 'country' ? formResponse.message : ''}
        id="country"
        labelTopRight={
          <span
            className="tooltip tooltip-left flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary-400 text-white"
            data-tip={dictionary.pages_profile.country_explanation}
          >
            <FaQuestion size={12} />
          </span>
        }
        marginTop={false}
        placeholder={dictionary.general.country}
        required={isLuuppiMember}
        title={dictionary.general.country}
        type="text"
        value={user.country ?? ''}
        onChange={() => setFormResponse(initialState)}
      />
      <FormCheckbox
        checked={declared}
        disabled={!isDeclarationPeriod}
        id="declaration"
        title={
          dictionary.pages_profile.declare_address +
          ' 1.9.' +
          declarationYear +
          ' - 30.11.' +
          (declarationYear + 1)
        }
        required
      />
      <div>
        <SubmitButton
          disabled={!isDeclarationPeriod}
          text={dictionary.general.submit}
        />
      </div>
    </form>
  );
}

function getDeclarationYear(d = new Date()): number {
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return month >= 9 ? year : year - 1;
}
