import { userEditRoles } from '@/actions/admin/user-edit-roles';
import FormAutocomplete from '@/components/FormAutocomplete/FormAutocomplete';
import SubmitButton from '@/components/SubmitButton/SubmitButton';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useEffect, useState } from 'react';
import { BiErrorCircle, BiInfinite } from 'react-icons/bi';
import { FindUserResult } from '../AdminUserEditor';

const initialState = {
  message: '',
  isError: false,
};

interface AdminRoleEditorProps {
  availableRoles: string[];
  user: NonNullable<FindUserResult>;
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default function AdminRoleEditor({
  availableRoles,
  user,
  dictionary,
  lang,
}: AdminRoleEditorProps) {
  const [formResponse, setFormResponse] = useState(initialState);
  const [expirationDateModalOpen, setExpirationDateModalOpen] = useState<
    string | null
  >(null);
  const [selectedExpirationDate, setSelectedExpirationDate] =
    useState<Date | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<
    {
      strapiRoleUuid: string;
      expiresAt: Date | null;
      createdAt: Date;
    }[]
  >([]);

  useEffect(() => {
    if (user) {
      setFormResponse(initialState);
      setSelectedRoles(user.roles);
    }
  }, [user]);

  const handleRoleEdit = async () => {
    setFormResponse(initialState);

    const response = await userEditRoles(
      selectedRoles.map((role) => ({
        strapiRoleUuid: role.strapiRoleUuid,
        expiresAt: role.expiresAt,
      })),
      lang,
      user.entraUserUuid,
    );

    setFormResponse(response);
  };

  return (
    <>
      <dialog
        className={`modal modal-bottom sm:modal-middle ${expirationDateModalOpen ? 'modal-open' : ''}`}
      >
        <div className="modal-box max-h-[calc(100dvh-6em)]">
          <h3 className="text-lg font-bold">
            {dictionary.general.expiration_date}
          </h3>
          <div className="flex flex-col py-4 text-sm">
            <div className="join">
              <input
                className="input input-bordered w-full rounded-r-none"
                min={new Date().toISOString().split('T')[0]}
                placeholder={dictionary.general.expiration_date}
                type="date"
                value={
                  selectedExpirationDate
                    ? selectedExpirationDate.toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => {
                  setSelectedExpirationDate(new Date(e.target.value));
                }}
              />
              <button
                className="btn join-item"
                onClick={() => {
                  setSelectedExpirationDate(null);
                }}
              >
                <BiInfinite size={24} />
              </button>
            </div>
          </div>
          <div className="modal-action">
            <button
              className="btn btn-sm"
              onClick={() => {
                setSelectedExpirationDate(null);
                setExpirationDateModalOpen(null);
              }}
            >
              {dictionary.general.close}
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setSelectedRoles(
                  selectedRoles.map((role) => {
                    if (role.strapiRoleUuid === expirationDateModalOpen) {
                      return {
                        ...role,
                        expiresAt: selectedExpirationDate,
                      };
                    }
                    return role;
                  }),
                );
                setSelectedExpirationDate(null);
                setExpirationDateModalOpen(null);
              }}
            >
              {dictionary.general.save}
            </button>
          </div>
        </div>
        <label
          className="modal-backdrop"
          onClick={() => {
            setExpirationDateModalOpen(null);
          }}
        >
          Close
        </label>
      </dialog>
      <form
        action={handleRoleEdit}
        className="card card-body mt-6 bg-background-50"
      >
        <h2 className="mb-4 text-lg font-semibold">
          {dictionary.pages_admin.role_management}
        </h2>
        <p className="mb-4 max-w-2xl text-sm text-gray-500">
          {dictionary.pages_admin.user_roles_info}
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
        <FormAutocomplete
          marginTop={false}
          noResultsText={dictionary.general.no_results}
          options={availableRoles.filter(
            (role) =>
              !selectedRoles.some(
                (selectedRole) => selectedRole.strapiRoleUuid === role,
              ),
          )}
          placeholder={dictionary.pages_admin.search_for_role + '...'}
          title={dictionary.pages_admin.search_for_role}
          onChange={() => {
            setFormResponse(initialState);
          }}
          onSelect={(role) => {
            setSelectedRoles([
              ...selectedRoles,
              {
                strapiRoleUuid: role,
                expiresAt: null,
                createdAt: new Date(),
              },
            ]);
          }}
        />
        <div className="mb-4 flex flex-col">
          <div className="label pt-0">
            <span className="label-text">
              {dictionary.pages_admin.user_roles}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
            {selectedRoles.length === 0 && (
              <span className="ml-1 text-sm font-semibold">
                {dictionary.pages_admin.no_roles}
              </span>
            )}
            {selectedRoles
              .sort((role) => role.createdAt.getTime())
              .map((role) => (
                <div
                  key={role.strapiRoleUuid}
                  className="rounded-lg bg-primary-100 p-4"
                >
                  <div>
                    <p className="line-clamp-2 font-semibold">
                      {role.strapiRoleUuid}
                    </p>
                    <p className="flex items-center gap-1 text-sm">
                      <span className="font-semibold">
                        {dictionary.general.expires}:
                      </span>{' '}
                      {role.expiresAt
                        ? role.expiresAt?.toLocaleDateString()
                        : 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">
                        {dictionary.general.created_at}:
                      </span>{' '}
                      {role.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="mt-2 text-sm underline"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedRoles(
                          selectedRoles.filter(
                            (selectedRole) =>
                              selectedRole.strapiRoleUuid !==
                              role.strapiRoleUuid,
                          ),
                        );
                      }}
                    >
                      {dictionary.general.delete}
                    </button>
                    <button
                      className="mt-2 text-sm underline"
                      onClick={(e) => {
                        e.preventDefault();
                        setExpirationDateModalOpen(role.strapiRoleUuid);
                        setSelectedExpirationDate(role.expiresAt);
                      }}
                    >
                      {dictionary.general.expiration_date}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div>
          <SubmitButton text={dictionary.general.save} />
        </div>
      </form>
    </>
  );
}
