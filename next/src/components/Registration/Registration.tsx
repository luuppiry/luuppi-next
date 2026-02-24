import { reservationCancel } from '@/actions/reservation-cancel';
import { longDateFormat, shortTimeFormat } from '@/libs/constants';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { $Enums } from '@prisma/client';
import PickupQRCode from '../PickupQRCode/PickupQRCode';
import QuestionButton from '../QuestionButton/QuestionButton';
import SubmitButton from '../SubmitButton/SubmitButton';
import RegistrationCounter from './RegistrationCounter';
import QRCode from 'qrcode';

interface RegistrationProps {
  registration: {
    name: string;
    location: string;
    startDate: Date;
    endDate: Date;
    price: number;
    createdAt: Date;
    reservedUntil: Date;
    paymentCompleted: boolean;
    deletedAt: Date | null;
    id: number;
    pickupCode?: string | null;
    pickedUp?: boolean;
  };
  questions: {
    answerableUntil: Date | null;
    eventDocumentId: string;
    text: any[];
    select: any[];
    checkbox: any[];
  };
  answers: {
    id: number;
    type: $Enums.QuestionType;
    question: string;
    answer: string;
    entraUserUuid: string;
    registrationId: number;
  }[];
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

const createQrCode = async (pickupCode: string) =>
  QRCode.toDataURL(pickupCode, {
    width: 200,
    margin: 0,
    color: { dark: '#000000', light: '#FFFFFF' },
  }).catch(() => null);

export default async function Registration({
  registration,
  dictionary,
  lang,
  questions,
  answers,
}: RegistrationProps) {
  const reservationCancelAction = reservationCancel.bind(null, lang);

  const displayQuestionButton = (
    registration: RegistrationProps['registration'],
    questions: RegistrationProps['questions'],
  ) => {
    // Fallback to the day before the event if the registration does not have an answerableUntil date
    const eventStart = new Date(registration.startDate);

    const answersChangeable = questions.answerableUntil
      ? questions.answerableUntil >= new Date()
      : eventStart >= new Date();

    const hasQuestions =
      questions.text.length > 0 ||
      questions.select.length > 0 ||
      questions.checkbox.length > 0;

    const registrationCancelled = registration.deletedAt !== null;

    return answersChangeable && !registrationCancelled && hasQuestions;
  };

  const displayCancelReservationButton = (
    registration: RegistrationProps['registration'],
  ) => {
    const reservationExpired = registration.reservedUntil < new Date();
    const registrationCancelled = registration.deletedAt !== null;
    const paymentCompleted = registration.paymentCompleted;

    return !reservationExpired && !registrationCancelled && !paymentCompleted;
  };

  const redeemedOrPaid = registration.price === 0 ? 'redeemed' : 'paid';

  return (
    <div
      key={registration.id}
      className="flex gap-4 rounded-lg bg-background-50"
    >
      <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
      <div className="flex w-full flex-col gap-2 p-4">
        <div className="flex w-full justify-between gap-4 max-md:flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <h2 className="line-clamp-2 break-all text-lg font-semibold max-md:text-base">
              {registration.name}
            </h2>
            <h2 className="flex items-center gap-4 text-xl font-semibold max-md:text-lg">
              <span>{registration.price?.toFixed(2)} €</span>
              <span
                className={`badge max-md:badge-sm ${
                  registration.paymentCompleted &&
                  (registration.pickupCode ? registration.pickedUp : true)
                    ? 'badge-success text-white'
                    : 'badge-warning text-gray-800'
                }`}
              >
                {registration.paymentCompleted
                  ? registration.pickupCode
                    ? registration.pickedUp
                      ? dictionary.pages_admin.picked_up
                      : dictionary.pages_events.not_picked_up
                    : dictionary.general[redeemedOrPaid]
                  : dictionary.pages_events.reserved}
              </span>
              {registration.reservedUntil >= new Date() &&
                !registration.paymentCompleted && (
                  <RegistrationCounter expiresAt={registration.reservedUntil} />
                )}
            </h2>
            <div className="flex items-center gap-6">
              <p className="text-sm">
                {firstLetterToUpperCase(
                  registration.createdAt.toLocaleString(lang, longDateFormat),
                )}{' '}
                {registration.createdAt.toLocaleString(lang, shortTimeFormat)}
              </p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            {registration.paymentCompleted &&
              registration.pickupCode &&
              !registration.pickedUp && (
                <PickupQRCode
                  dictionary={dictionary}
                  pickupCode={registration.pickupCode}
                  pickupQrCode={await createQrCode(registration.pickupCode)}
                />
              )}
            {displayQuestionButton(registration, questions) && (
              <QuestionButton
                answers={answers}
                dictionary={dictionary}
                questions={questions}
                reservationId={registration.id}
              />
            )}
            {displayCancelReservationButton(registration) && (
              <form action={reservationCancelAction}>
                <input
                  name="registrationId"
                  type="hidden"
                  value={registration.id}
                />
                <SubmitButton
                  className="btn-outline max-md:btn-xs"
                  text={dictionary.pages_events.cancel_reservation}
                  variant="error"
                />
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
