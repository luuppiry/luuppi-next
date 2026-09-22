'use client';

import Tooltip from '@/components/Tooltip/Tooltip';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { PiCheckCircle, PiCircle } from 'react-icons/pi';
import { getTicketColor } from './utils';
import { Dictionary } from '@/models/locale';

interface RegistrationDetail {
  id: number;
  ticketName: string;
  pickedUp: boolean;
  answers: Record<string, string>;
}

interface RegistrationsTableRowProps {
  lang: string;
  dictionary: Dictionary;
  displayName: string;
  email: string;
  tickets: string[];
  questionKeys: string[];
  requiresPickup: boolean;
  pickedUpLabel: string;
  registrations: RegistrationDetail[];
  showTickets: boolean;
}

function renderAnswerCell(value: string | undefined, clamp = true) {
  if (value === undefined) return '-';
  if (/true|false/.test(value)) {
    return value === 'true' ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />;
  }
  return value ? (
    <span className={clamp ? 'line-clamp-2' : ''}>{value}</span>
  ) : (
    '-'
  );
}

export default function RegistrationsTableRow({
  dictionary,
  displayName,
  email,
  tickets,
  questionKeys,
  requiresPickup,
  pickedUpLabel,
  registrations,
  showTickets,
}: RegistrationsTableRowProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const pickedCount = registrations.filter((r) => r.pickedUp).length;
  const total = registrations.length;

  const showModal = () => {
    setIsOpen(true);

    window.requestAnimationFrame(() => dialogRef.current?.showModal());
  };

  return (
    <>
      <tr onClick={showModal}>
        <td className="max-w-20 whitespace-normal break-words">
          <div className="flex justify-between">
            {displayName || email}

            <div className="flex gap-1.5">
              {showTickets &&
                tickets.map((ticket, i) => (
                  <Tooltip key={i} content={ticket}>
                    <span
                      key={i}
                      className="float-right h-[1em] w-[1em] rounded-full"
                      style={{ background: getTicketColor(ticket) }}
                    />
                  </Tooltip>
                ))}
            </div>
          </div>
        </td>

        {questionKeys.map((key, i) => {
          const values = registrations
            .map((r) => r.answers[key])
            .filter((v): v is string => v !== undefined);
          const allSame = values.every((v) => v === values[0]);

          return (
            <td
              key={key}
              className={`max-w-44 text-pretty break-words bg-base-200/30 ${
                i === 0 ? 'border-l-2 border-base-content/10' : ''
              }`}
            >
              {values.length === 0 ? (
                '-'
              ) : allSame ? (
                renderAnswerCell(values[0])
              ) : (
                <span className="italic text-base-content/50">
                  {dictionary.pages_admin.multiple_answers}
                </span>
              )}
            </td>
          );
        })}

        {requiresPickup && (
          <td>
            <div className="flex items-center justify-center gap-1">
              {total > 1 ? (
                <span
                  className={`badge badge-sm ${
                    pickedCount === total
                      ? 'badge-success'
                      : pickedCount === 0
                        ? 'badge-ghost'
                        : 'badge-warning'
                  }`}
                >
                  {pickedCount}/{total}
                </span>
              ) : registrations[0]?.pickedUp ? (
                <PiCheckCircle className="text-success" size={20} />
              ) : (
                <PiCircle className="text-base-content/40" size={20} />
              )}
            </div>
          </td>
        )}
      </tr>

      {isOpen &&
        createPortal(
          <dialog
            ref={dialogRef}
            className="modal"
            onClose={() => setIsOpen(false)}
          >
            <div className="modal-box max-w-3xl">
              <h3 className="text-lg font-semibold">{displayName || email}</h3>
              <p className="text-sm text-base-content/60">{email}</p>

              <div className="mt-4 overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>{dictionary.pages_admin.ticket_type}</th>
                      {questionKeys.map((key) => (
                        <th key={key} className="whitespace-normal break-words">
                          {key}
                        </th>
                      ))}
                      {requiresPickup && (
                        <th className="text-center">{pickedUpLabel}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>{reg.ticketName}</td>
                        {questionKeys.map((key) => (
                          <td
                            key={key}
                            className="whitespace-normal break-words"
                          >
                            {renderAnswerCell(reg.answers[key], false)}
                          </td>
                        ))}
                        {requiresPickup && (
                          <td>
                            <div className="flex justify-center">
                              {reg.pickedUp ? (
                                <PiCheckCircle
                                  className="text-success"
                                  size={18}
                                />
                              ) : (
                                <PiCircle
                                  className="text-base-content/40"
                                  size={18}
                                />
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <form className="modal-backdrop" method="dialog">
              <button className="cursor-default">
                {dictionary.general.close}
              </button>
            </form>
          </dialog>,
          document.documentElement,
        )}
    </>
  );
}
