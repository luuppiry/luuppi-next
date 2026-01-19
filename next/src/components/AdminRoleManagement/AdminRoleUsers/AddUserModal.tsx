'use client';
import FormAutocomplete from '@/components/FormAutocomplete/FormAutocomplete';
import { Dictionary } from '@/models/locale';
import { User } from '@prisma/client';
import { BiInfinite } from 'react-icons/bi';

interface AddUserModalProps {
  dictionary: Dictionary;
  isOpen: boolean;
  availableUsers: User[];
  selectedUser: User | null;
  selectedExpirationDate: Date | null;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onUserSelect: (value: string) => void;
  onExpirationDateChange: (date: Date | null) => void;
  onAddUser: () => void;
}

export default function AddUserModal({
  dictionary,
  isOpen,
  availableUsers,
  selectedUser,
  selectedExpirationDate,
  onClose,
  onSearchChange,
  onUserSelect,
  onExpirationDateChange,
  onAddUser,
}: AddUserModalProps) {
  const handleClose = () => {
    onClose();
  };

  return (
    <dialog
      className={`modal modal-bottom sm:modal-middle ${isOpen ? 'modal-open' : ''}`}
    >
      <div className="modal-box max-h-[calc(100dvh-6em)]">
        <h3 className="text-lg font-bold">
          {dictionary.pages_admin.add_user_to_role}
        </h3>
        <div className="flex flex-col py-4">
          <FormAutocomplete
            marginTop={false}
            noResultsText={dictionary.general.no_results}
            options={availableUsers.map((u) => {
              const firstName =
                u.preferredFullName?.split(' ').at(0) ||
                u.firstName?.split(' ').at(0);
              const parsedFullName =
                firstName && u.lastName ? `(${firstName} ${u.lastName})` : '';

              return `${u.email} ${parsedFullName}`;
            })}
            placeholder={dictionary.pages_admin.search_users_to_add}
            title={dictionary.pages_admin.search_users_to_add}
            onChange={onSearchChange}
            onSelect={onUserSelect}
          />
          {selectedUser && (
            <div className="mt-4">
              <p className="text-sm">
                <span className="font-semibold">
                  {dictionary.general.email}:
                </span>{' '}
                {selectedUser.email}
              </p>
              <div className="mt-3">
                <label className="mb-2 block text-sm font-semibold">
                  {dictionary.general.expiration_date}
                </label>
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
                      onExpirationDateChange(new Date(e.target.value));
                    }}
                  />
                  <button
                    className="btn join-item"
                    onClick={() => {
                      onExpirationDateChange(null);
                    }}
                  >
                    <BiInfinite size={24} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-action">
          <button className="btn btn-sm" onClick={handleClose}>
            {dictionary.general.close}
          </button>
          {selectedUser && (
            <button className="btn btn-primary btn-sm" onClick={onAddUser}>
              {dictionary.pages_admin.add_user_to_role}
            </button>
          )}
        </div>
      </div>
      <label className="modal-backdrop" onClick={handleClose}>
        Close
      </label>
    </dialog>
  );
}
