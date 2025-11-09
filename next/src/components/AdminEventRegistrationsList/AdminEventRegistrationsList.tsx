'use client';
import { togglePickupStatus } from '@/actions/admin/toggle-pickup-status';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useState } from 'react';
import { PiCheckCircle, PiCircle } from 'react-icons/pi';

interface Registration {
  id: number;
  pickedUp: boolean;
  user: {
    username: string | null;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface Event {
  id: number;
  nameFi: string;
  nameEn: string;
  registrations: Registration[];
}

interface AdminEventRegistrationsListProps {
  event: Event;
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default function AdminEventRegistrationsList({
  event,
  dictionary,
  lang,
}: AdminEventRegistrationsListProps) {
  const [registrations, setRegistrations] = useState(event.registrations);
  const [loading, setLoading] = useState<number | null>(null);

  const handleTogglePickup = async (
    registrationId: number,
    currentStatus: boolean,
  ) => {
    setLoading(registrationId);
    const result = await togglePickupStatus(lang, registrationId, !currentStatus);
    
    if (!result.isError) {
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId
            ? { ...reg, pickedUp: !currentStatus }
            : reg,
        ),
      );
    } else {
      // Show error message
      alert(result.message);
    }
    
    setLoading(null);
  };

  const pickedUpCount = registrations.filter((r) => r.pickedUp).length;

  return (
    <div className="card card-body">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {dictionary.general.registrations}
        </h2>
        <div className="flex gap-2">
          <span className="badge badge-success">
            {dictionary.pages_admin.picked_up ?? 'Picked up'}: {pickedUpCount} /{' '}
            {registrations.length}
          </span>
        </div>
      </div>
      {registrations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th />
                <th>{dictionary.general.username}</th>
                <th>{dictionary.general.email}</th>
                <th>{dictionary.general.firstNames}</th>
                <th>{dictionary.general.lastName}</th>
                <th>
                  <span className="flex justify-center">
                    {dictionary.pages_admin.picked_up ?? 'Picked up'}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="[&>*:nth-child(odd)]:bg-primary-50">
              {registrations.map((registration, index) => (
                <tr key={registration.id}>
                  <th>{index + 1}</th>
                  <td>{registration.user.username ?? '???'}</td>
                  <td>{registration.user.email}</td>
                  <td>{registration.user.firstName ?? '-'}</td>
                  <td>{registration.user.lastName ?? '-'}</td>
                  <td>
                    <div className="flex justify-center">
                      <button
                        onClick={() =>
                          handleTogglePickup(
                            registration.id,
                            registration.pickedUp,
                          )
                        }
                        disabled={loading === registration.id}
                        className="btn btn-circle btn-ghost"
                        aria-label={
                          registration.pickedUp
                            ? dictionary.pages_admin.mark_not_picked_up ?? 'Mark as not picked up'
                            : dictionary.pages_admin.mark_picked_up ?? 'Mark as picked up'
                        }
                      >
                        {loading === registration.id ? (
                          <span className="loading loading-spinner loading-md" />
                        ) : registration.pickedUp ? (
                          <PiCheckCircle
                            className="text-success"
                            size={26}
                          />
                        ) : (
                          <PiCircle
                            className="text-gray-400"
                            size={26}
                          />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm">{dictionary.general.no_registrations ?? 'No registrations'}</p>
      )}
    </div>
  );
}
