'use client';
import { roleAddUser, roleRemoveUser } from '@/actions/admin/role-manage-users';
import { GetRoleUsersResponse } from '@/app/api/roles/[roleId]/users/route';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { Role, RolesOnUsers, User } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';
import { BiTrash, BiUserPlus } from 'react-icons/bi';
import AddUserModal from './AddUserModal';
import Alert from '@/components/AdminShared/components/Alert';
import DataTable, {
  TableColumn,
} from '@/components/AdminShared/components/DataTable';
import Pagination from '@/components/AdminShared/components/Pagination';
import SearchBar from '@/components/AdminShared/components/SearchBar';
import { useDebounce } from '@/components/AdminShared/hooks/useDebounce';

interface AdminRoleUsersProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
  role: Role & {
    users: (RolesOnUsers & { user: User })[];
  };
}

const PAGE_SIZE = 30;

type UserRow = NonNullable<
  Extract<GetRoleUsersResponse, { isError: false }>['users']
>[number];

export default function AdminRoleUsers({
  dictionary,
  lang,
  role,
}: AdminRoleUsersProps) {
  const [users, setUsers] = useState<UserRow[]>([]);
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

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    setPage(1);
  };

  const columns: TableColumn<UserRow>[] = [
    {
      header: dictionary.general.email,
      render: (user) => (
        <div className="max-w-xs font-medium">
          <div className="truncate">{user.email}</div>
        </div>
      ),
    },
    {
      header: dictionary.general.first_name,
      render: (user) => (
        <div className="max-w-xs font-medium">
          <div className="truncate">{user.firstName}</div>
        </div>
      ),
    },
    {
      header: dictionary.general.lastName,
      render: (user) => (
        <div className="max-w-xs font-medium">
          <div className="truncate">{user.lastName}</div>
        </div>
      ),
    },
    {
      header: dictionary.general.expires,
      render: (user) =>
        user.roleInfo?.expiresAt
          ? new Date(user.roleInfo.expiresAt).toLocaleDateString()
          : dictionary.general.never,
    },
    {
      header: dictionary.general.actions,
      className: 'text-right',
      render: (user) => (
        <button
          className="btn btn-error btn-sm"
          onClick={() => handleRemoveUser(user.entraUserUuid)}
        >
          <BiTrash size={16} />
        </button>
      ),
    },
  ];

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
          <SearchBar
            placeholder={dictionary.general.search}
            value={inputValue}
            onChange={handleSearchChange}
          />
        </div>

        {error && <Alert message={error} type="error" />}

        {success && <Alert message={success} type="success" />}

        <DataTable
          columns={columns}
          data={users}
          emptyMessage={
            search
              ? dictionary.general.no_search_results
              : dictionary.pages_admin.no_role_users
          }
          getRowKey={(user) => user.entraUserUuid}
          isLoading={isLoading}
          loadingRowCount={5}
        />

        <Pagination
          currentPage={page}
          isLoading={isLoading}
          pageSize={PAGE_SIZE}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}
