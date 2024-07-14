import { Dictionary } from '@/models/locale';
import { useState } from 'react';
import { IoOpenOutline } from 'react-icons/io5';
import { FindUserResult } from '../AdminUserEditor';

interface AdminEventsTableProps {
  dictionary: Dictionary;
  user: NonNullable<FindUserResult>;
}

export default function AdminEventsTable({
  dictionary,
  user,
}: AdminEventsTableProps) {
  const [detailsModalOpen, setDetailsModalOpen] = useState<
    (typeof user)['registrations'][number] | null
  >(null);

  return (
    <>
      <dialog
        className={`modal modal-bottom sm:modal-middle ${detailsModalOpen ? 'modal-open' : ''}`}
      >
        <div className="modal-box max-h-[calc(100dvh-6em)] sm:w-11/12 sm:max-w-[1000px]">
          <h3 className="text-lg font-bold">
            {dictionary.pages_admin.registration_info}
          </h3>
          <div className="flex flex-col py-4 text-sm">
            <div className="flex py-2 max-md:flex-col">
              <span className="flex-1 font-semibold">
                {dictionary.general.event}
              </span>
              {detailsModalOpen?.ticketType.name}
            </div>
            {detailsModalOpen?.paymentCompleted && (
              <div className="flex py-2 max-md:flex-col">
                <span className="flex-1 font-semibold">
                  {dictionary.general.status}
                </span>
                <span className="badge badge-success badge-sm font-semibold text-white">
                  {dictionary.pages_events.paid}
                </span>
              </div>
            )}
            {!detailsModalOpen?.paymentCompleted && (
              <span className="badge badge-warning badge-sm font-semibold">
                {dictionary.pages_events.reserved}
              </span>
            )}
            {detailsModalOpen?.reservedUntil &&
              !detailsModalOpen?.paymentCompleted &&
              detailsModalOpen?.reservedUntil > new Date() && (
                <div className="flex py-2 max-md:flex-col">
                  <span className="flex-1 font-semibold">
                    {dictionary.general.expires}
                  </span>
                  {detailsModalOpen?.reservedUntil.toLocaleString()}
                </div>
              )}
            <div className="flex py-2 max-md:flex-col">
              <span className="flex-1 font-semibold">
                {dictionary.general.price}
              </span>
              {detailsModalOpen?.ticketType.price}€
            </div>
            <span className="divider h-px opacity-30" />
            <div>
              <span className="flex-1 font-semibold">
                {dictionary.general.questions}
              </span>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th />
                      <th>{dictionary.general.question}</th>
                      <th>{dictionary.general.answer}</th>
                    </tr>
                  </thead>
                  <tbody className="[&>*:nth-child(odd)]:bg-primary-50">
                    {detailsModalOpen?.answers.map((registration, index) => (
                      <tr key={index}>
                        <th>{index + 1}</th>
                        <td className="truncate">{registration.question}</td>
                        <td className="truncate">{registration.answer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <span className="divider h-px opacity-30" />
            <div>
              <span className="flex-1 font-semibold">
                {dictionary.general.payments}
              </span>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th />
                      <th>{dictionary.general.order_id}</th>
                      <th>{dictionary.general.status}</th>
                    </tr>
                  </thead>
                  <tbody className="[&>*:nth-child(odd)]:bg-primary-50">
                    {detailsModalOpen?.payments.map((payment, index) => (
                      <tr key={index}>
                        <th>{index + 1}</th>
                        <td className="truncate">{payment.orderId}</td>
                        <td className="truncate font-semibold">
                          {payment.status === 'CANCELLED' ? (
                            <span className="badge badge-neutral badge-sm">
                              {dictionary.general.cancelled}
                            </span>
                          ) : payment.status === 'COMPLETED' ? (
                            <span className="badge badge-success badge-sm text-white">
                              {dictionary.pages_events.paid}
                            </span>
                          ) : (
                            <span className="badge badge-warning badge-sm">
                              {dictionary.pages_events.reserved}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="modal-action">
            <button
              className="btn btn-sm"
              onClick={() => {
                setDetailsModalOpen(null);
              }}
            >
              {dictionary.general.close}
            </button>
          </div>
        </div>
        <label
          className="modal-backdrop"
          onClick={() => {
            setDetailsModalOpen(null);
          }}
        >
          Close
        </label>
      </dialog>
      <div className="card card-body mt-6 bg-background-50">
        <h2 className="mb-4 text-lg font-semibold">
          {dictionary.pages_admin.event_history}
        </h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th />
                <th>{dictionary.general.event}</th>
                <th>{dictionary.general.status}</th>
                <th>{dictionary.general.price}</th>
                <th>
                  <span className="flex justify-end">
                    {dictionary.general.actions}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="[&>*:nth-child(odd)]:bg-primary-50">
              {user?.registrations?.map((registration, index) => (
                <tr key={registration.id}>
                  <th>{index + 1}</th>
                  <td className="truncate">{registration.ticketType.name}</td>
                  <td>
                    <span
                      className={`badge badge-sm font-semibold ${
                        registration.paymentCompleted
                          ? 'badge-success text-white'
                          : 'badge-warning text-gray-800'
                      }`}
                    >
                      {registration.paymentCompleted
                        ? dictionary.pages_events.paid
                        : dictionary.pages_events.reserved}
                    </span>
                  </td>
                  <td>{registration.ticketType.price} €</td>
                  <td>
                    <div className="flex items-center justify-end">
                      <button
                        className="btn btn-circle btn-ghost btn-sm"
                        type="button"
                        onClick={() => setDetailsModalOpen(registration)}
                      >
                        <IoOpenOutline size={24} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}