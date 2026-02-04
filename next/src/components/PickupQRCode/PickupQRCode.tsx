'use client';
import { Dictionary } from '@/models/locale';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { PiCheckCircle, PiCircle } from 'react-icons/pi';

interface PickupQRCodeProps {
  pickupCode: string;
  pickedUp: boolean;
  dictionary: Dictionary;
}

export default function PickupQRCode({
  pickupCode,
  pickedUp,
  dictionary,
}: PickupQRCodeProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(pickupCode, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch (_error) {
        // Silently fail - QR code is optional
      }
    };

    if (pickupCode && showQR) {
      generateQRCode();
    }
  }, [pickupCode, showQR]);

  if (!pickupCode) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {pickedUp ? (
          <PiCheckCircle className="text-success" size={20} />
        ) : (
          <PiCircle className="text-gray-400" size={20} />
        )}
        <span className="text-sm font-semibold">
          {pickedUp
            ? (dictionary.pages_admin.picked_up ?? 'Picked up')
            : (dictionary.pages_events.not_picked_up ?? 'Not picked up yet')}
        </span>
      </div>
      <button
        className="btn btn-outline btn-sm max-w-xs"
        type="button"
        onClick={() => setShowQR(!showQR)}
      >
        {showQR
          ? (dictionary.pages_events.hide_qr_code ?? 'Hide QR Code')
          : (dictionary.pages_events.show_qr_code ?? 'Show Pickup QR Code')}
      </button>

      {showQR && qrCodeDataUrl && (
        <div className="flex flex-col items-center gap-2 rounded-lg bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Pickup QR Code" className="rounded" src={qrCodeDataUrl} />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-600">
              {dictionary.pages_events.pickup_code ?? 'Pickup code'}:
            </span>
            <span className="font-mono text-2xl font-bold tracking-wider">
              {pickupCode}
            </span>
            <span className="text-xs text-gray-500">
              {dictionary.pages_events.show_to_admin ??
                'Show this code to the administrator'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
