 'use client';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import React from 'react';
import { PiCheckCircle, PiCircle } from 'react-icons/pi';

interface Registration {
  id: number;
  pickedUp: boolean;
  pickupCode: string | null;
  user: {
    username: string | null;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  answers: {
    id: number;
    type: string;
    question: string;
    answer: string;
  }[];
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
  requiresPickup: boolean;
}

export default function AdminEventRegistrationsList({
  event,
  dictionary,
  lang: _lang,
  requiresPickup,
}: AdminEventRegistrationsListProps) {
  const sortedRegistrations = React.useMemo(
    () => [...event.registrations].sort((a, b) => a.user.email.localeCompare(b.user.email)),
    [event.registrations],
  );

  const pickedUpCount = sortedRegistrations.filter((r) => r.pickedUp).length;
  const pickedUpLabel = dictionary.pages_admin.picked_up;

  return (
    <div className="card card-body">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {dictionary.general.registrations}
        </h2>
        {requiresPickup && (
          <div className="flex gap-2">
            <span className="badge badge-primary">
              {dictionary.pages_admin.picked_up}: {pickedUpCount} /{' '}
              {sortedRegistrations.length}
            </span>
          </div>
        )}
      </div>
  {sortedRegistrations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>{dictionary.general.email}</th>
                <th>{dictionary.general.firstNames}</th>
                <th>{dictionary.general.lastName}</th>
                <th>{dictionary.pages_admin.registration_answers}</th>
                {requiresPickup && (
                  <th>
                    <span className="flex justify-center">
                              {pickedUpLabel}
                    </span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="[&>*:nth-child(odd)]:bg-primary-50">
              {sortedRegistrations.map((registration, index) => (
                <React.Fragment key={registration.id}>
                  <tr>
                    <th>{index + 1}</th>
                    <td>{registration.user.email}</td>
                    <td>{registration.user.firstName ?? '-'}</td>
                    <td>{registration.user.lastName ?? '-'}</td>
                    <td>
                      <div className="space-y-1 max-w-lg">
                        {registration.answers.map((answer) => (
                          <div key={answer.id} className="rounded bg-white p-2">
                            <p className="text-sm font-semibold text-gray-700">{answer.question}</p>
                            <p className="text-sm text-gray-900">{answer.answer}</p>
                          </div>
                        ))}
                      </div>
                    </td>
                    {requiresPickup && (
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          {registration.pickedUp ? (
                            <>
                              <PiCheckCircle className="text-success" size={20} />
                            </>
                          ) : (
                            <>
                              <PiCircle className="text-gray-400" size={20} />
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm">
          {dictionary.general.no_registrations}
        </p>
      )}
    </div>
  );
}
