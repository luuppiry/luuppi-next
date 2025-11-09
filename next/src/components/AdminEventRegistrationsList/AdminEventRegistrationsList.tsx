'use client';
import { togglePickupStatus } from '@/actions/admin/toggle-pickup-status';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import React, { useState } from 'react';
import { PiCheckCircle, PiCircle, PiCaretDown, PiCaretRight } from 'react-icons/pi';

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
}

export default function AdminEventRegistrationsList({
  event,
  dictionary,
  lang,
}: AdminEventRegistrationsListProps) {
  const [registrations, setRegistrations] = useState(event.registrations);
  const [loading, setLoading] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleTogglePickup = async (
    registrationId: number,
    currentStatus: boolean,
  ) => {
    setLoading(registrationId);
    const result = await togglePickupStatus(
      lang,
      registrationId,
      !currentStatus,
    );

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

  const toggleRowExpansion = (registrationId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(registrationId)) {
        newSet.delete(registrationId);
      } else {
        newSet.add(registrationId);
      }
      return newSet;
    });
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
                    {dictionary.pages_events.pickup_code ?? 'Pickup Code'}
                  </span>
                </th>
                <th>
                  <span className="flex justify-center">
                    {dictionary.pages_admin.picked_up ?? 'Picked up'}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="[&>*:nth-child(odd)]:bg-primary-50">
              {registrations.map((registration, index) => (
                <React.Fragment key={registration.id}>
                  <tr>
                    <th>
                      <button
                        className="btn btn-circle btn-ghost btn-xs"
                        onClick={() => toggleRowExpansion(registration.id)}
                        type="button"
                      >
                        {expandedRows.has(registration.id) ? (
                          <PiCaretDown size={16} />
                        ) : (
                          <PiCaretRight size={16} />
                        )}
                      </button>
                      {index + 1}
                    </th>
                    <td>{registration.user.username ?? '???'}</td>
                    <td>{registration.user.email}</td>
                    <td>{registration.user.firstName ?? '-'}</td>
                    <td>{registration.user.lastName ?? '-'}</td>
                    <td>
                      <div className="flex justify-center">
                        <span className="font-mono font-semibold">
                          {registration.pickupCode ?? '-'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-center">
                        <button
                          aria-label={
                            registration.pickedUp
                              ? dictionary.pages_admin.mark_not_picked_up ??
                                'Mark as not picked up'
                              : dictionary.pages_admin.mark_picked_up ??
                                'Mark as picked up'
                          }
                          className="btn btn-circle btn-ghost"
                          disabled={loading === registration.id}
                          onClick={() =>
                            handleTogglePickup(
                              registration.id,
                              registration.pickedUp,
                            )
                          }
                        >
                          {loading === registration.id ? (
                            <span className="loading loading-spinner loading-md" />
                          ) : registration.pickedUp ? (
                            <PiCheckCircle className="text-success" size={26} />
                          ) : (
                            <PiCircle className="text-gray-400" size={26} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(registration.id) && registration.answers.length > 0 && (
                    <tr key={`${registration.id}-answers`}>
                      <td colSpan={7} className="bg-base-200 p-4">
                        <div className="ml-8">
                          <h4 className="mb-2 font-semibold">
                            {dictionary.pages_admin.registration_answers ?? 'Registration Answers'}:
                          </h4>
                          <div className="space-y-2">
                            {registration.answers.map((answer) => (
                              <div key={answer.id} className="rounded bg-white p-2">
                                <p className="text-sm font-semibold text-gray-700">
                                  {answer.question}
                                </p>
                                <p className="text-sm text-gray-900">
                                  {answer.answer}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm">
          {dictionary.general.no_registrations ?? 'No registrations'}
        </p>
      )}
    </div>
  );
}
