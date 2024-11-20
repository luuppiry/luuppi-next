'use client';
import {
  GetUsersResponse,
  GetUsersSuccessResponse,
} from '@/app/api/users/route';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { BiErrorCircle, BiSearch } from 'react-icons/bi';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface AdminUsersTableProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

const PAGE_SIZE = 25;

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default function AdminUsersTable({
  dictionary,
  lang,
}: AdminUsersTableProps) {
  const [users, setUsers] = useState<GetUsersSuccessResponse['users']>([]);
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
    } catch (error) {
      setError(dictionary.api.server_error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, lang, dictionary.api.server_error]);

  useEffect(() => {
    loadUsers();
  }, [page, search, loadUsers]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getMembershipInfo = (
    user: GetUsersSuccessResponse['users'][number],
  ) => {
    const memberRole = user.roles.find(
      (r) => r.role.strapiRoleUuid === process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID,
    );
    return {
      isMember: Boolean(memberRole),
      expiresAt: memberRole?.expiresAt,
    };
  };

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
          <div className="join w-full sm:w-auto">
            <div className="join-item inline-flex h-12 items-center border border-r-0 bg-secondary-400 px-3">
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
                <th />
                <th>{dictionary.general.email}</th>
                <th>{dictionary.general.first_name}</th>
                <th>{dictionary.general.last_name}</th>
                <th>{dictionary.general.username}</th>
                <th className="text-center">{dictionary.general.membership}</th>
                <th>{dictionary.general.expires}</th>
              </tr>
            </thead>
            <tbody className="[&>*:nth-child(odd)]:bg-primary-50">
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <th className="w-8">
                      <div className="h-4 w-4 rounded bg-gray-200" />
                    </th>
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
                      <div className="h-4 w-32 rounded bg-gray-200" />
                    </td>
                    <td className="text-center">
                      <div className="mx-auto h-4 w-16 rounded bg-gray-200" />
                    </td>
                    <td>
                      <div className="h-4 w-20 rounded bg-gray-200" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td className="h-32 text-center text-gray-500" colSpan={7}>
                    {search
                      ? dictionary.general.no_search_results
                      : dictionary.general.no_users}
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const { isMember, expiresAt } = getMembershipInfo(user);
                  return (
                    <tr
                      key={user.id}
                      className="cursor-pointer hover:bg-base-200"
                      onClick={() =>
                        router.push(`/admin/user/${user.entraUserUuid}`)
                      }
                    >
                      <th className="truncate">{user.id}</th>
                      <td className="max-w-xs font-medium">
                        <div className="truncate">{user.email}</div>
                      </td>
                      <td>{user.firstName || '-'}</td>
                      <td>{user.lastName || '-'}</td>
                      <td className="max-w-[150px]">
                        <div className="truncate">{user.username || '-'}</div>
                      </td>
                      <td className="text-center">
                        {isMember ? (
                          <span className="badge badge-success badge-sm text-white">
                            {dictionary.general.yes}
                          </span>
                        ) : (
                          <span className="badge badge-error badge-sm text-white">
                            {dictionary.general.no}
                          </span>
                        )}
                      </td>
                      <td>
                        {isMember
                          ? expiresAt
                            ? new Date(expiresAt).toLocaleDateString()
                            : dictionary.general.never
                          : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-4">
          <div className="flex flex-1 items-center gap-2 text-sm text-gray-600">
            <span>{dictionary.general.total}:</span>
            {isLoading ? (
              <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
            ) : (
              <span className="font-medium">{total}</span>
            )}
          </div>
          <div className="join">
            <button
              className="btn join-item btn-sm"
              disabled={isLoading || page === 1}
              onClick={() => setPage(page - 1)}
            >
              <MdChevronLeft size={24} />
            </button>
            <button className="btn btn-disabled join-item no-animation btn-sm">
              {page} / {totalPages}
            </button>
            <button
              className="btn join-item btn-sm"
              disabled={isLoading || page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <MdChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
