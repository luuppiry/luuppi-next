'use client';
import { GetRolesResponse } from '@/app/api/roles/route';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { BiErrorCircle, BiSearch } from 'react-icons/bi';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface AdminRolesTableProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
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

export default function AdminRolesTable({
  dictionary,
  lang,
}: AdminRolesTableProps) {
  const [roles, setRoles] = useState<
    NonNullable<Extract<GetRolesResponse, { isError: false }>['roles']>
  >([]);
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
          <div className="join w-full sm:w-auto">
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

        <div className="relative overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{dictionary.pages_admin.role_details}</th>
                <th>{dictionary.pages_admin.active_users}</th>
              </tr>
            </thead>
            <tbody className="[&>*:nth-child(odd)]:bg-primary-50">
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td>
                      <div className="h-4 w-48 rounded bg-gray-200" />
                    </td>
                    <td>
                      <div className="h-4 w-32 rounded bg-gray-200" />
                    </td>
                  </tr>
                ))
              ) : roles.length === 0 ? (
                <tr>
                  <td className="h-32 text-center text-gray-500" colSpan={2}>
                    {search
                      ? dictionary.general.no_role_search_results
                      : dictionary.pages_admin.no_roles}
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr
                    key={role.id}
                    className="cursor-pointer hover:bg-base-200"
                    onClick={() =>
                      router.push(`/${lang}/admin/roles/${role.strapiRoleUuid}`)
                    }
                  >
                    <td className="max-w-xs font-medium">
                      <div className="truncate">{role.strapiRoleUuid}</div>
                    </td>
                    <td>
                      {role.users.length}{' '}
                      <span className="text-xs text-gray-500">
                        {dictionary.pages_admin.role_user_count}
                      </span>
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
