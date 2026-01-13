'use client';
import {
  GetUsersResponse,
  GetUsersSuccessResponse,
} from '@/app/api/users/route';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Alert from '@/components/AdminShared/components/Alert';
import DataTable, {
  TableColumn,
} from '@/components/AdminShared/components/DataTable';
import Pagination from '@/components/AdminShared/components/Pagination';
import SearchBar from '@/components/AdminShared/components/SearchBar';
import { useDebounce } from '@/components/AdminShared/hooks/useDebounce';

interface AdminUsersTableProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

const PAGE_SIZE = 25;

type UserRow = GetUsersSuccessResponse['users'][number];

export default function AdminUsersTable({
  dictionary,
  lang,
}: AdminUsersTableProps) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const search = useDebounce(inputValue, 300);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: PAGE_SIZE.toString(),
        search,
        lang,
      });

      const response = await fetch(`/api/users?${params}`);
      const result = (await response.json()) as GetUsersResponse;

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
  }, [page, search, lang, dictionary.api.server_error]);

  useEffect(() => {
    loadUsers();
  }, [page, search, loadUsers]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getMembershipInfo = (user: UserRow) => {
    const memberRole = user.roles.find(
      (r) => r.role.strapiRoleUuid === process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID,
    );
    return {
      isMember: Boolean(memberRole),
      expiresAt: memberRole?.expiresAt,
    };
  };

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    setPage(1);
  };

  const columns: TableColumn<UserRow>[] = [
    {
      header: '',
      render: (user) => <span className="truncate">{user.id}</span>,
    },
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
      accessor: 'firstName',
      render: (user) => user.firstName || '-',
    },
    {
      header: dictionary.general.last_name,
      accessor: 'lastName',
      render: (user) => user.lastName || '-',
    },
    {
      header: dictionary.general.username,
      render: (user) => (
        <div className="max-w-[150px]">
          <div className="truncate">{user.username || '-'}</div>
        </div>
      ),
    },
    {
      header: dictionary.general.membership,
      className: 'text-center',
      render: (user) => {
        const { isMember } = getMembershipInfo(user);
        return isMember ? (
          <span className="badge badge-success badge-sm text-white">
            {dictionary.general.yes}
          </span>
        ) : (
          <span className="badge badge-error badge-sm text-white">
            {dictionary.general.no}
          </span>
        );
      },
    },
    {
      header: dictionary.general.expires,
      render: (user) => {
        const { isMember, expiresAt } = getMembershipInfo(user);
        if (!isMember) return '-';
        return expiresAt
          ? new Date(expiresAt).toLocaleDateString()
          : dictionary.general.never;
      },
    },
  ];

  return (
    <>
      <div className="card card-body mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {dictionary.pages_admin.user_management}
            </h2>
            <p className="max-w-md text-sm text-gray-500">
              {dictionary.pages_admin.user_management_description}
            </p>
          </div>
          <SearchBar
            placeholder={dictionary.general.search}
            value={inputValue}
            onChange={handleSearchChange}
          />
        </div>

        {error && <Alert message={error} type="error" />}

        <DataTable
          columns={columns}
          data={users}
          emptyMessage={
            search
              ? dictionary.general.no_search_results
              : dictionary.general.no_users
          }
          getRowKey={(user) => user.id}
          isLoading={isLoading}
          loadingRowCount={PAGE_SIZE}
          onRowClick={(user) =>
            router.push(`/admin/user/${user.entraUserUuid}`)
          }
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
