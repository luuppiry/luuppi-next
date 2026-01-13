'use client';
import { GetRolesResponse } from '@/app/api/roles/route';
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

interface AdminRolesTableProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

const PAGE_SIZE = 30;

type RoleRow = NonNullable<
  Extract<GetRolesResponse, { isError: false }>['roles']
>[number];

export default function AdminRolesTable({
  dictionary,
  lang,
}: AdminRolesTableProps) {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const search = useDebounce(inputValue, 300);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: PAGE_SIZE.toString(),
        search,
        lang,
      });

      const response = await fetch(`/api/roles?${params}`);
      const result = (await response.json()) as GetRolesResponse;

      if (result.isError) {
        setError(result.message);
      } else {
        setRoles(result.roles || []);
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
    loadRoles();
  }, [page, search, loadRoles]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    setPage(1);
  };

  const columns: TableColumn<RoleRow>[] = [
    {
      header: dictionary.pages_admin.role_details,
      render: (role) => (
        <div className="max-w-xs font-medium">
          <div className="truncate">{role.strapiRoleUuid}</div>
        </div>
      ),
    },
    {
      header: dictionary.pages_admin.active_users,
      render: (role) => (
        <>
          {role.users.length}{' '}
          <span className="text-xs text-gray-500">
            {dictionary.pages_admin.role_user_count}
          </span>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="card card-body mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {dictionary.pages_admin.roles_management}
            </h2>
            <p className="max-w-md text-sm text-gray-500">
              {dictionary.pages_admin.roles_management_description}
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
          data={roles}
          emptyMessage={
            search
              ? dictionary.general.no_role_search_results
              : dictionary.pages_admin.no_roles
          }
          getRowKey={(role) => role.id}
          isLoading={isLoading}
          loadingRowCount={PAGE_SIZE}
          onRowClick={(role) =>
            router.push(`/${lang}/admin/roles/${role.strapiRoleUuid}`)
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
