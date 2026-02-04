'use client';
import { userEditGeneral } from '@/actions/admin/user-edit-general';
import { UserWithRegistrations } from '@/app/[lang]/(content-pages)/(protected-pages)/admin/user/[slug]/page';
import FormInput from '@/components/FormInput/FormInput';
import FormSelect from '@/components/FormSelect/FormSelect';
import SubmitButton from '@/components/SubmitButton/SubmitButton';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useState } from 'react';
import { BiErrorCircle } from 'react-icons/bi';

interface UserEditGeneralResponse {
  message: string;
  isError: boolean;
  field?: string;
}

const initialState: UserEditGeneralResponse = {
  message: '',
  isError: false,
  field: '',
};

interface AdminUserGeneralProps {
  dictionary: Dictionary;
  user: UserWithRegistrations;
  lang: SupportedLanguage;
}

export default function AdminUserGeneral({
  dictionary,
  user,
  lang,
}: AdminUserGeneralProps) {
  const [formResponse, setFormResponse] = useState(initialState);

  const handleUserEdit = async (formData: FormData) => {
    const response = await userEditGeneral(formData, lang, user.entraUserUuid);
    setFormResponse(response);
  };

  const userIsLuuppiMember = user.roles.some(
    (role) => role.strapiRoleUuid === process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID,
  );

  const hasMissingInformation =
    userIsLuuppiMember &&
    (!user.firstName || !user.lastName || !user.domicle || !user.major);

  return (
    <>
      <form action={handleUserEdit} className="card card-body">
        <h2 className="mb-4 text-lg font-semibold">
          {dictionary.general.general_info}
        </h2>
        {hasMissingInformation && (
          <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
            <BiErrorCircle size={24} />
            {dictionary.pages_admin.user_required_info_missing}
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
          id={'email'}
          labelTopRight={
            <span className="text-xs text-gray-500">
              {dictionary.pages_admin.read_only}
            </span>
          }
          marginTop={false}
          placeholder={dictionary.general.email}
          title={dictionary.general.email}
          type="email"
          value={user.email ?? ''}
          readonly
          onChange={() => setFormResponse(initialState)}
        />
        <FormInput
          error={formResponse.field === 'username' ? formResponse.message : ''}
          id={'username'}
          marginTop={false}
          placeholder={dictionary.general.username}
          required={false}
          title={dictionary.general.username}
          value={user.username ?? ''}
          onChange={() => setFormResponse(initialState)}
        />
        <FormInput
          error={formResponse.field === 'firstName' ? formResponse.message : ''}
          id={'firstName'}
          marginTop={false}
          placeholder={dictionary.general.firstNames}
          required={false}
          title={dictionary.general.firstNames}
          value={user.firstName ?? ''}
          onChange={() => setFormResponse(initialState)}
        />
        <FormInput
          error={formResponse.field === 'lastName' ? formResponse.message : ''}
          id={'lastName'}
          marginTop={false}
          placeholder={dictionary.general.lastName}
          required={false}
          title={dictionary.general.lastName}
          value={user.lastName ?? ''}
          onChange={() => setFormResponse(initialState)}
        />
        <FormInput
          error={
            formResponse.field === 'preferredFullName'
              ? formResponse.message
              : ''
          }
          id={'preferredFullName'}
          marginTop={false}
          placeholder={dictionary.general.preferredFullName}
          required={false}
          title={dictionary.general.preferredFullName}
          type="text"
          value={user.preferredFullName ?? ''}
          onChange={() => setFormResponse(initialState)}
        />
        <FormSelect
          id={'major'}
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
        <FormInput
          error={formResponse.field === 'domicle' ? formResponse.message : ''}
          id={'domicle'}
          marginTop={false}
          placeholder={dictionary.general.domicle}
          required={false}
          title={dictionary.general.domicle}
          type="text"
          value={user.domicle ?? ''}
          onChange={() => setFormResponse(initialState)}
        />
        <div>
          <SubmitButton text={dictionary.general.save} />
        </div>
      </form>
      {/* Add expiration modal outside the parent modal with higher z-index */}
      <dialog className="modal modal-bottom z-50 sm:modal-middle">
        <div className="modal-box relative">
          {/* expiration modal content */}
        </div>
        <label className="modal-backdrop" />
      </dialog>
    </>
  );
}
