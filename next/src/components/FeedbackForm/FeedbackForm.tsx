'use client';
import { sendVerifyEmail } from '@/actions/send-verify-email';
import { luuppiEmails } from '@/libs/constants/emails';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useState } from 'react';
import { BiErrorCircle } from 'react-icons/bi';
import FormInput from '../FormInput/FormInput';
import FormSelect from '../FormSelect/FormSelect';
import FormTextArea from '../FormTextArea/FormTextArea';

interface FeedbackResponse {
  message: string;
  isError: boolean;
  field?: string;
}

const initialState: FeedbackResponse = {
  message: '',
  isError: false,
  field: '',
};

interface FeedbackFormProps {
  lang: SupportedLanguage;
  dictionary: Dictionary;
}

export default function FeedbackForm({ lang, dictionary }: FeedbackFormProps) {
  const handleFeedbackAction = sendVerifyEmail.bind(null, lang);
  const [formResponse, setFormResponse] = useState(initialState);

  const updateFeedback = async (formData: FormData) => {
    const response = await handleFeedbackAction(null, formData);
    setFormResponse(response);
  };

  return (
    <form action={updateFeedback} className="card card-body">
      <div className="flex w-full flex-col">
        {Boolean(
          formResponse.isError && formResponse.message && !formResponse.field,
        ) && (
          <div className="alert mb-4 rounded-lg bg-red-200 text-sm text-red-800">
            <BiErrorCircle size={24} />
            {formResponse.message}
          </div>
        )}
        {Boolean(
          !formResponse.isError && formResponse.message && !formResponse.field,
        ) && (
          <div className="alert mb-4 rounded-lg bg-green-200 text-sm text-green-800">
            {formResponse.message}
          </div>
        )}
        <FormInput
          error={formResponse.field === 'name' ? formResponse.message : ''}
          id="name"
          marginTop={false}
          placeholder={dictionary.pages_feedback.name}
          required={false}
          title={dictionary.pages_feedback.name}
        />
        <FormInput
          error={formResponse.field === 'email' ? formResponse.message : ''}
          id="email"
          marginTop={false}
          placeholder={dictionary.pages_feedback.email}
          required={false}
          title={dictionary.pages_feedback.email}
          type="email"
        />
        <FormSelect
          id="receiver"
          marginTop={false}
          options={luuppiEmails.map((email) => ({
            label:
              dictionary.roles[
                email.translation as keyof typeof dictionary.roles
              ],
            value: email.email,
          }))}
          title={dictionary.pages_feedback.receiver}
          value={luuppiEmails[0].email}
          onChange={() => setFormResponse(initialState)}
        />
        <FormInput
          error={formResponse.field === 'subject' ? formResponse.message : ''}
          id="subject"
          marginTop={false}
          placeholder={dictionary.pages_feedback.subject}
          title={dictionary.pages_feedback.subject}
        />
        <FormTextArea
          error={formResponse.field === 'message' ? formResponse.message : ''}
          id="message"
          marginTop={false}
          placeholder={dictionary.pages_feedback.message}
          title={dictionary.pages_feedback.message}
        />
        <div>
          <button className="btn btn-primary text-white">
            {dictionary.pages_feedback.send}
          </button>
        </div>
      </div>
    </form>
  );
}
