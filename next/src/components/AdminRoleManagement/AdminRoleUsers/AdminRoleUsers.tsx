'use client';
import { roleAddUser, roleRemoveUser } from '@/actions/admin/role-manage-users';
import { GetRoleUsersResponse } from '@/app/api/roles/[roleId]/users/route';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { Role, RolesOnUsers, User } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';
import { BiErrorCircle, BiSearch, BiTrash, BiUserPlus } from 'react-icons/bi';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import AddUserModal from './AddUserModal';

interface AdminRoleUsersProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
  role: Role & {
    users: (RolesOnUsers & { user: User })[];
  };
}

const PAGE_SIZE = 30;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function AdminRoleUsers({
  dictionary,
  lang,
  role,
}: AdminRoleUsersProps) {
  const [users, setUsers] = useState<
    NonNullable<Extract<GetRoleUsersResponse, { isError: false }>['users']>
  >([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const search = useDebounce(inputValue, 300);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [searchUserInput, setSearchUserInput] = useState('');
  const searchUser = useDebounce(searchUserInput, 300);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedExpirationDate, setSelectedExpirationDate] =
    useState<Date | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: PAGE_SIZE.toString(),
        search,
        lang,
      });

      const response = await fetch(
        `/api/roles/${role.strapiRoleUuid}/users?${params}`,
      );
      const result = (await response.json()) as GetRoleUsersResponse;

      if (result.isError) {
        setError(result.message);
      } else {
        setUsers(result.users || []);
        setTotal(result.total || 0);
        setError('');
      }
    } catch (_error) {
      setError(dictionary.api.server_error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, lang, dictionary.api.server_error, role.strapiRoleUuid]);

  const loadAvailableUsers = useCallback(async () => {
    if (!searchUser) {
      setAvailableUsers([]);
      return;
    }

    try {
      const params = new URLSearchParams({
        page: '1',
        pageSize: '10',
        search: searchUser,
        lang,
      });

      const response = await fetch(`/api/users?${params}`);
      const result = await response.json();

      if (!result.isError) {
        // Filter out users who already have this role
        const filtered = result.users.filter(
          (user: User) =>
            !users.some((u) => u.entraUserUuid === user.entraUserUuid),
        );
        setAvailableUsers(filtered);
      }
    } catch (_error) {
      // Silently fail
    }
  }, [searchUser, lang, users]);

  useEffect(() => {
    loadUsers();
  }, [page, search, loadUsers]);

  useEffect(() => {
    loadAvailableUsers();
  }, [searchUser, loadAvailableUsers]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleRemoveUser = async (userEntraUuid: string) => {
    const result = await roleRemoveUser(
      role.strapiRoleUuid,
      userEntraUuid,
      lang,
    );
    if (result.isError) {
      setError(result.message);
      setSuccess('');
    } else {
      setSuccess(result.message);
      setError('');
      await loadUsers();
    }
  };

  const handleAddUser = async () => {
    if (!selectedUser) return;

    const result = await roleAddUser(
      role.strapiRoleUuid,
      selectedUser.entraUserUuid,
      selectedExpirationDate,
      lang,
    );

    if (result.isError) {
      setError(result.message);
      setSuccess('');
    } else {
      setSuccess(result.message);
      setError('');
      setAddUserModalOpen(false);
      setSelectedUser(null);
      setSelectedExpirationDate(null);
      setSearchUserInput('');
      await loadUsers();
    }
  };

  const handleCloseModal = () => {
    setAddUserModalOpen(false);
    setSelectedUser(null);
    setSelectedExpirationDate(null);
    setSearchUserInput('');
  };

  const handleUserSelect = (value: string) => {
    const email = value.split(' (').at(0);
    const user = availableUsers.find((u) => u.email === email);

    if (user) {
      setSelectedUser(user);
    }
  };

  return (
    <>
      <AddUserModal
        availableUsers={availableUsers}
        dictionary={dictionary}
        isOpen={addUserModalOpen}
        selectedExpirationDate={selectedExpirationDate}
        selectedUser={selectedUser}
        onAddUser={handleAddUser}
        onClose={handleCloseModal}
        onExpirationDateChange={setSelectedExpirationDate}
        onSearchChange={setSearchUserInput}
        onUserSelect={handleUserSelect}
      />

      <div className="card card-body mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {dictionary.pages_admin.role_users}
            </h2>
            <p className="max-w-md text-sm text-gray-500">
              {total} {dictionary.pages_admin.role_user_count}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setAddUserModalOpen(true)}
            >
              <BiUserPlus size={20} />
              {dictionary.pages_admin.add_user_to_role}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="join w-full">
            <div className="join-item inline-flex h-12 items-center border border-r-0 bg-secondary-400 px-3 dark:border-[var(--fallback-bc,oklch(var(--bc)/.2))] dark:bg-primary-500">
              <BiSearch className="text-white" size={20} />
            </div>
            <input
              className="input join-item input-bordered h-12 w-full"
              placeholder={dictionary.general.search}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {error && (
          <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
            <BiErrorCircle size={24} />
            {error}
          </div>
        )}

        {success && (
          <div className="alert mb-4 rounded-lg bg-green-200 text-sm text-green-800">
            {success}
          </div>
        )}

        <div className="relative overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{dictionary.general.email}</th>
                <th>{dictionary.general.first_name}</th>
                <th>{dictionary.general.lastName}</th>
                <th>{dictionary.general.expires}</th>
                <th className="text-right">{dictionary.general.actions}</th>
              </tr>
            </thead>
            <tbody className="[&>*:nth-child(odd)]:bg-primary-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td>
                      <div className="h-4 w-48 rounded bg-gray-200" />
                    </td>
                    <td>
                      <div className="h-4 w-24 rounded bg-gray-200" />
                    </td>
                    <td>
                      <div className="h-4 w-24 rounded bg-gray-200" />
                    </td>
                    <td>
                      <div className="h-4 w-24 rounded bg-gray-200" />
                    </td>
                    <td className="text-right">
                      <div className="ml-auto h-4 w-16 rounded bg-gray-200" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td className="h-32 text-center text-gray-500" colSpan={5}>
                    {search
                      ? dictionary.general.no_search_results
                      : dictionary.pages_admin.no_role_users}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.entraUserUuid}>
                    <td className="max-w-xs font-medium">
                      <div className="truncate">{user.email}</div>
                    </td>
                    <td className="max-w-xs font-medium">
                      <div className="truncate">{user.firstName}</div>
                    </td>
                    <td className="max-w-xs font-medium">
                      <div className="truncate">{user.lastName}</div>
                    </td>
                    <td>
                      {user.roleInfo?.expiresAt
                        ? new Date(user.roleInfo.expiresAt).toLocaleDateString()
                        : dictionary.general.never}
                    </td>
                    <td className="text-right">
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleRemoveUser(user.entraUserUuid)}
                      >
                        <BiTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex flex-wrap items-center justify-end gap-4">
            <div className="flex flex-1 items-center gap-2 text-sm text-gray-600">
              {isLoading ? (
                <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
              ) : (
                <span className="font-medium">
                  {`${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} / ${total}`}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-primary btn-sm"
                disabled={isLoading || page === 1}
                onClick={() => setPage(page - 1)}
              >
                <MdChevronLeft size={24} />
              </button>
              <button
                className="btn btn-primary btn-sm"
                disabled={isLoading || page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <MdChevronRight size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
