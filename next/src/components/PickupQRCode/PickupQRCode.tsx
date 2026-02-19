// pickup-qr-code.tsx
'use client';
import { Dictionary } from '@/models/locale';
import Image from 'next/image';
import QRCode from 'qrcode';
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
  dictionary: Dictionary;
}

export default function PickupQRCode({
  pickupCode,
  dictionary,
}: PickupQRCodeProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!pickupCode || !isOpen) return;

    QRCode.toDataURL(pickupCode, {
      width: 200,
      margin: 0,
      color: { dark: '#000000', light: '#FFFFFF' },
    })
      .then(setQrCodeDataUrl)
      .catch(() => {}); // QR code is optional
  }, [pickupCode, isOpen]);

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
              {qrCodeDataUrl && (
                <Image
                  alt="Pickup QR Code"
                  className="rounded"
                  height={200}
                  src={qrCodeDataUrl}
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
