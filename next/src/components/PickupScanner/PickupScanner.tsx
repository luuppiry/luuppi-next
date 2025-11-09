'use client';
import { togglePickupStatus } from '@/actions/admin/toggle-pickup-status';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useState, useRef } from 'react';
import { PiCamera, PiKeyboard, PiX } from 'react-icons/pi';

interface PickupScannerProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
  eventId: number;
  onSuccess?: () => void;
}

export default function PickupScanner({
  dictionary,
  lang,
  onSuccess,
}: PickupScannerProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('manual');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setLoading(true);
    setMessage(null);

    const result = await togglePickupStatus(lang, manualCode.toUpperCase().trim(), true);

    if (result.isError) {
      setMessage({ text: result.message, isError: true });
    } else {
      setMessage({
        text: `${dictionary.general.success}: ${result.data?.username || result.data?.email}`,
        isError: false,
      });
      setManualCode('');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    }

    setLoading(false);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setScanMode('camera');
    } catch (_error) {
      setMessage({
        text: dictionary.pages_admin.camera_not_available ?? 'Camera not available',
        isError: true,
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setScanMode('manual');
  };

  const closeScanner = () => {
    stopCamera();
    setShowScanner(false);
    setManualCode('');
    setMessage(null);
  };

  return (
    <div>
      <button
        className="btn btn-primary"
        type="button"
        onClick={() => setShowScanner(true)}
      >
        {dictionary.pages_admin.scan_pickup_code ?? 'Scan Pickup Code'}
      </button>

      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {dictionary.pages_admin.scan_pickup_code ?? 'Scan Pickup Code'}
              </h3>
              <button
                className="btn btn-circle btn-ghost btn-sm"
                type="button"
                onClick={closeScanner}
              >
                <PiX size={24} />
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              <button
                className={`btn flex-1 ${scanMode === 'manual' ? 'btn-primary' : 'btn-outline'}`}
                type="button"
                onClick={() => {
                  stopCamera();
                  setScanMode('manual');
                }}
              >
                <PiKeyboard size={20} />
                {dictionary.pages_admin.manual_entry ?? 'Manual Entry'}
              </button>
              <button
                className={`btn flex-1 ${scanMode === 'camera' ? 'btn-primary' : 'btn-outline'}`}
                type="button"
                onClick={startCamera}
              >
                <PiCamera size={20} />
                {dictionary.pages_admin.camera ?? 'Camera'}
              </button>
            </div>

            {scanMode === 'camera' && (
              <div className="mb-4">
                <video
                  ref={videoRef}
                  className="w-full rounded"
                  autoPlay
                  playsInline
                />
                <p className="mt-2 text-center text-sm text-gray-600">
                  {dictionary.pages_admin.camera_scanning_note ??
                    'Camera scanning coming soon. Use manual entry for now.'}
                </p>
              </div>
            )}

            {scanMode === 'manual' && (
              <form onSubmit={handleManualSubmit}>
                <div className="form-control mb-4">
                  <label className="label" htmlFor="pickup-code">
                    <span className="label-text">
                      {dictionary.pages_events.pickup_code ?? 'Pickup Code'}
                    </span>
                  </label>
                  <input
                    autoFocus
                    className="input input-bordered font-mono uppercase"
                    id="pickup-code"
                    maxLength={6}
                    placeholder="ABC123"
                    type="text"
                    value={manualCode}
                    onChange={(e) =>
                      setManualCode(e.target.value.toUpperCase())
                    }
                  />
                  <label className="label">
                    <span className="label-text-alt text-gray-500">
                      {dictionary.pages_admin.enter_6_char_code ??
                        'Enter 6-character code (e.g., ABC123)'}
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
                  disabled={loading || manualCode.length !== 6}
                  type="submit"
                >
                  {loading ? (
                    <span className="loading loading-spinner" />
                  ) : (
                    dictionary.pages_admin.mark_picked_up ?? 'Mark as Picked Up'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
