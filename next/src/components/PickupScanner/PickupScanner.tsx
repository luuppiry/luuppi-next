'use client';
import { togglePickupStatus } from '@/actions/admin/toggle-pickup-status';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from 'react-aria-components';
import { PiX } from 'react-icons/pi';

interface PickupScannerProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
  eventDocumentId: string;
}

export default function PickupScanner({
  dictionary,
  lang,
  eventDocumentId,
}: PickupScannerProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleManualSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setMessage(null);

    const result = await togglePickupStatus(
      lang,
      code.toUpperCase().trim(),
      true,
      eventDocumentId,
    );

    if (result.isError) {
      setMessage({ text: result.message, isError: true });
    } else {
      setMessage({
        text: `${dictionary.general.success}: ${result.data?.email}`,
        isError: false,
      });
      setCode('');
    }

    setLoading(false);
  };

  const closeScanner = () => {
    setIsOpen(false);
    setCode('');
    setMessage(null);
  };

  return (
    <DialogTrigger>
      <Button
        className="btn btn-primary"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        {dictionary.pages_admin.scan_pickup_code}
      </Button>

      <ModalOverlay
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        isOpen={isOpen}
        isDismissable
        onOpenChange={setIsOpen}
      >
        <Modal>
          <Dialog className="w-full max-w-md rounded-lg bg-base-100 p-6 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {dictionary.pages_admin.scan_pickup_code}
              </h3>
              <button
                className="btn btn-circle btn-ghost animate-none"
                type="button"
                onClick={closeScanner}
              >
                <PiX size={24} />
              </button>
            </div>

            <form onSubmit={handleManualSubmit}>
              <div className="form-control mb-4">
                <label className="label" htmlFor="pickup-code">
                  <span className="label-text">
                    {dictionary.pages_events.pickup_code}
                  </span>
                </label>
                <input
                  className="input input-bordered font-mono uppercase"
                  id="pickup-code"
                  maxLength={6}
                  placeholder="ABC123"
                  type="text"
                  value={code}
                  autoFocus
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    {dictionary.pages_admin.enter_6_char_code}
                  </span>
                </label>
              </div>

              {message && (
                <div
                  className={`alert mb-4 ${message.isError ? 'alert-error' : 'alert-success'}`}
                >
                  {message.text}
                </div>
              )}

              <button
                className="btn btn-primary w-full"
                disabled={loading || code.length !== 6}
                type="submit"
              >
                {loading ? (
                  <span className="loading loading-spinner" />
                ) : (
                  dictionary.pages_admin.mark_picked_up
                )}
              </button>
            </form>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
