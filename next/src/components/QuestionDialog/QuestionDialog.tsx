'use client';
import { reservationQuestionSubmit } from '@/actions/reservation-question-submit';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { QuestionContext } from '@/providers/QuestionProvider';
import { useContext, useRef, useState } from 'react';
import { BiErrorCircle } from 'react-icons/bi';
import FormCheckbox from '../FormCheckbox/FormCheckbox';
import FormInput from '../FormInput/FormInput';
import FormSelect from '../FormSelect/FormSelect';
import SubmitButton from '../SubmitButton/SubmitButton';

interface QuestionDialogProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default function QuestionDialog({
  dictionary,
  lang,
}: QuestionDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const ctx = useContext(QuestionContext);
  const [response, setResponse] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  const handleClose = () => {
    ctx.setData(null);
  };

  const handleSubmit = async () => {
    const form = formRef.current;

    if (!form) return;

    // Find all select, input and checkbox elements and get their values
    const allowedIdStarts = ['select-', 'text-', 'checkbox-'];

    const formValues = Array.from(form.elements)
      .filter((element) =>
        allowedIdStarts.some((idStart) => element.id.startsWith(idStart)),
      )
      .map((element) => ({
        id: element.id,
        type: element.id.split('-')[0] as 'select' | 'text' | 'checkbox',
        value: element.id.startsWith('checkbox-')
          ? (element as HTMLInputElement).checked
          : (element as HTMLInputElement).value,
      }));

    const response = await reservationQuestionSubmit(
      ctx.data?.reservationId || 0,
      lang,
      formValues,
    );

    if (response) {
      setResponse(response);
      return;
    }

    handleClose();
  };

  if (!ctx.data) return null;

  const hasAnswers = ctx.data.answers.find(
    (answer) => answer.registrationId === ctx.data?.reservationId,
  );

  const getSelectValue = (
    question: {
      ChoicesFi: string;
      ChoicesEn: string;
    },
    index: number,
  ) => {
    const choicesFiArray = question.ChoicesFi.split(',');
    const choicesEnArray = question.ChoicesEn.split(',');

    const answer = ctx.data?.answers.find(
      (answer) => answer.question === `select-${index}`,
    )?.answer;

    return lang === 'fi'
      ? choicesFiArray[parseInt(answer ?? '0', 10)]
      : choicesEnArray[parseInt(answer ?? '0', 10)];
  };

  return (
    <dialog className={'modal modal-open modal-bottom sm:modal-middle'}>
      <form
        ref={formRef}
        action={handleSubmit}
        className="modal-box max-h-[calc(100dvh-6em)]"
      >
        <h3 className="text-lg font-bold">
          {hasAnswers
            ? dictionary.pages_events.edit_additional_info
            : dictionary.pages_events.fill_additional_info}
        </h3>
        {response && response.isError && (
          <div className="alert mt-2 rounded-lg bg-red-200 text-sm text-red-800">
            <BiErrorCircle size={24} />
            {response.message}
          </div>
        )}
        <div className="flex flex-col py-4 text-sm">
          {ctx.data.questions.text.map((question, index) => (
            <FormInput
              key={index}
              id={`text-${index}`}
              marginTop={false}
              maxLength={question.MaxLength}
              minLength={question.MinLength}
              placeholder={
                lang === 'fi' ? question.QuestionFi : question.QuestionEn
              }
              required={question.Required}
              title={lang === 'fi' ? question.QuestionFi : question.QuestionEn}
              value={
                ctx.data?.answers.find(
                  (answer) => answer.question === `text-${index}`,
                )?.answer ?? ''
              }
            />
          ))}
          {ctx.data.questions.select.map((question, index) => (
            <FormSelect
              key={index}
              id={`select-${index}`}
              marginTop={false}
              options={getQuestionChoices(
                lang === 'fi' ? question.ChoicesFi : question.ChoicesEn,
              )}
              required={true}
              title={lang === 'fi' ? question.QuestionFi : question.QuestionEn}
              value={getSelectValue(question, index)}
            />
          ))}
          {ctx.data.questions.checkbox.map((question, index) => (
            <FormCheckbox
              key={index}
              checked={
                ctx.data?.answers.find(
                  (answer) => answer.question === `checkbox-${index}`,
                )?.answer === 'true'
              }
              id={`checkbox-${index}`}
              required={false}
              title={lang === 'fi' ? question.QuestionFi : question.QuestionEn}
            />
          ))}
        </div>
        <div className="modal-action">
          <button className="btn btn-sm" onClick={handleClose}>
            {dictionary.general.close}
          </button>
          <SubmitButton text={dictionary.general.submit} />
        </div>
      </form>
      <label className="modal-backdrop" onClick={handleClose}>
        Close
      </label>
    </dialog>
  );
}

function getQuestionChoices(choices: string) {
  return choices.split(',').map((choice) => ({ value: choice, label: choice }));
}
