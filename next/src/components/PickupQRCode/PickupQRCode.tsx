'use client';
import { Dictionary } from '@/models/locale';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from 'react-aria-components';

interface PickupQRCodeProps {
  pickupCode: string;
  pickupQrCode: string | null;
  dictionary: Dictionary;
}

export default function PickupQRCode({
  pickupCode,
  pickupQrCode,
  dictionary,
}: PickupQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const eventSource = new EventSource(`/api/tickets/${pickupCode}/stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.isPickedUp) {
        setIsOpen(false);
        router.refresh();

        eventSource.close();
      }
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [pickupCode, router]);

  if (!pickupCode) return null;

  return (
    <DialogTrigger>
      <Button
        className="btn btn-primary btn-sm grow-0 max-md:btn-xs"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        {dictionary.pages_events.show_qr_code}
      </Button>

      <ModalOverlay
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        isOpen={isOpen}
        isDismissable
        onOpenChange={setIsOpen}
      >
        <Modal>
          <Dialog className="w-full max-w-md rounded-lg bg-base-100 p-6">
            <div className="flex flex-col gap-2">
              {pickupQrCode && (
                <Image
                  alt="Pickup QR Code"
                  className="rounded"
                  height={200}
                  src={pickupQrCode}
                  width={200}
                  unoptimized
                />
              )}

              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-600">
                  {dictionary.pages_events.pickup_code}:
                </span>
                <span className="font-mono text-2xl font-bold tracking-wider">
                  {pickupCode}
                </span>
                <span className="text-xs text-gray-500">
                  {dictionary.pages_events.show_to_admin}
                </span>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
