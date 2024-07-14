'use client';
import { userFind } from '@/actions/admin/user-find';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useRef, useState } from 'react';
import { BiErrorCircle } from 'react-icons/bi';
import FormInput from '../FormInput/FormInput';
import SubmitButton from '../SubmitButton/SubmitButton';
import AdminEventsTable from './AdminEventsTable/AdminEventsTable';
import AdminRoleEditor from './AdminRoleEditor/AdminRoleEditor';
import AdminUserGeneral from './AdminUserGeneral/AdminUserGeneral';

const initialState = {
  message: '',
  isError: false,
};

interface AdminUserManagementProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
  roles: string[];
}

export type FindUserResult =
  | null
  | Awaited<ReturnType<typeof userFind>>['user'];

export default function AdminUserManagement({
  dictionary,
  lang,
  roles,
}: AdminUserManagementProps) {
  const [formResponse, setFormResponse] = useState(initialState);
  const [user, setUser] = useState<FindUserResult>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFindUser = async (formData: FormData) => {
    const response = await userFind(formData, lang);
    setFormResponse({
      isError: response.isError,
      message: response.message,
    });
    if (!response.isError) {
      setUser(response.user);
    }
  };

  return (
    <>
      <div className="flex w-full flex-col">
        <form
          ref={formRef}
          action={handleFindUser}
          className="card card-body mb-6 bg-background-50"
        >
          <h2 className="mb-4 text-lg font-semibold">
            {dictionary.pages_admin.user_management}
          </h2>
          <p className="mb-4 max-w-2xl text-sm text-gray-500">
            {dictionary.pages_admin.user_general_info}
          </p>
          {Boolean(formResponse.isError && formResponse.message) && (
            <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
              <BiErrorCircle size={24} />
              {formResponse.message}
            </div>
          )}
          <FormInput
            id="email"
            marginTop={false}
            placeholder={dictionary.general.email}
            title={dictionary.general.email}
            type="email"
            onChange={() => {
              setFormResponse(initialState);
              setUser(null);
            }}
          />
          <div>
            <SubmitButton text={dictionary.general.search} />
          </div>
        </form>
        {user && (
          <>
            <div className="mb-4 flex items-center justify-between gap-6">
              <h2 className="line-clamp-1 break-all text-xl font-semibold">
                {user.email}
              </h2>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setUser(null);
                  formRef.current?.reset();
                  setFormResponse(initialState);
                }}
              >
                {dictionary.general.close}
              </button>
            </div>
            <AdminUserGeneral dictionary={dictionary} lang={lang} user={user} />
            <AdminRoleEditor
              availableRoles={roles}
              dictionary={dictionary}
              lang={lang}
              user={user}
            />
            <AdminEventsTable dictionary={dictionary} user={user} />
          </>
        )}
      </div>
    </>
  );
}
