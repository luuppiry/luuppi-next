'use client';
import { togglePickupStatus } from '@/actions/admin/toggle-pickup-status';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import { useCallback, useState } from 'react';
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
  const [isPaused, setIsPaused] = useState(false);

  const highlightCodeOnCanvas = (
    detectedCodes: IDetectedBarcode[],
    ctx: CanvasRenderingContext2D,
  ) => {
    detectedCodes.forEach((detectedCode) => {
      const { boundingBox } = detectedCode;

      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 4;
      ctx.strokeRect(
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height,
      );
    });
  };

  const handleProcessCode = useCallback(
    async (inputCode: string) => {
      const cleanCode = inputCode.trim().toUpperCase();
      if (!cleanCode || loading) return;

      setLoading(true);
      setMessage(null);

      const result = await togglePickupStatus(
        lang,
        cleanCode,
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

      if (isOpen) {
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          if (!result.isError) {
            setMessage(null);
          }
        }, 2000);
      }
    },
    [lang, eventDocumentId, dictionary, isOpen, loading],
  );

  const onScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0 && !isPaused) {
      const scannedValue = detectedCodes[0].rawValue;
      setCode(scannedValue);
      handleProcessCode(scannedValue);
    }
  };

  const closeScanner = () => {
    setIsOpen(false);
    setCode('');
    setMessage(null);
    setIsPaused(false);
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button
        className="btn btn-primary"
        type="button"
        onPress={() => setIsOpen(true)}
      >
        {dictionary.pages_admin.scan_pickup_code}
      </Button>

      <ModalOverlay
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        isDismissable
      >
        <Modal>
          <Dialog className="w-full max-w-md rounded-lg bg-base-100 p-6 pt-2 outline-none">
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

            <div
              className={`h-60 overflow-clip rounded-xl border-4 shadow-md transition-all ${
                message
                  ? message.isError
                    ? 'border-error'
                    : 'border-success'
                  : 'border-transparent'
              }`}
            >
              <Scanner
                components={{ tracker: highlightCodeOnCanvas }}
                formats={['qr_code']}
                paused={isPaused}
                onScan={onScan}
              />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessCode(code);
              }}
            >
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
