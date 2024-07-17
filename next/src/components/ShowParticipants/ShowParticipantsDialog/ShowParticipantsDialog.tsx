'use client';
import SubmitButton from '@/components/SubmitButton/SubmitButton';
import { Dictionary } from '@/models/locale';
import { useState } from 'react';
import { FaUsers } from 'react-icons/fa';

interface ShowParticipantsDialogProps {
  participants: string[];
  dictionary: Dictionary;
}

export default function ShowParticipantsDialog({
  participants,
  dictionary,
}: ShowParticipantsDialogProps) {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);

  return (
    <>
      <form action={openModal} className="mt-6">
        <SubmitButton text={dictionary.pages_events.show_participants}>
          <FaUsers size={24} />
        </SubmitButton>
      </form>
      <dialog
        className={`modal modal-bottom sm:modal-middle ${showModal ? 'modal-open' : ''}`}
      >
        <div className="modal-box max-h-[calc(100dvh-6em)]">
          <h3 className="text-lg font-bold">
            {dictionary.general.participants}
          </h3>
          <div className="flex flex-col py-4 text-sm">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{dictionary.general.username}</th>
                  </tr>
                </thead>
                <tbody className="[&>*:nth-child(odd)]:bg-primary-50">
                  {participants.map((username, index) => (
                    <tr key={index}>
                      <th>{index + 1}</th>
                      <td className="truncate">{username}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-action">
            <button
              className="btn btn-sm"
              onClick={() => {
                setShowModal(false);
              }}
            >
              {dictionary.general.close}
            </button>
          </div>
        </div>
        <label className="modal-backdrop" onClick={() => setShowModal(false)}>
          Close
        </label>
      </dialog>
    </>
  );
}
