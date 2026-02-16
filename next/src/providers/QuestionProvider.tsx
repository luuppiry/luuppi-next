'use client';
import { $Enums } from '@prisma/client';
import { createContext, useState } from 'react';

interface QuestionProviderProps {
  children: React.ReactNode;
}

interface QuestionData {
  reservationId: number;
  questions: {
    eventDocumentId: string;
    text: {
      id?: number;
      QuestionEn: string;
      QuestionFi: string;
      MaxLength: number;
      MinLength: number;
      Required: boolean;
    }[];
    select: {
      id?: number;
      ChoicesEn: string;
      ChoicesFi: string;
      QuestionEn: string;
      QuestionFi: string;
    }[];
    checkbox: {
      id?: number;
      QuestionFi: string;
      QuestionEn: string;
    }[];
  };
  answers: {
    id: number;
    type: $Enums.QuestionType;
    question: string;
    answer: string;
    entraUserUuid: string;
    registrationId: number;
  }[];
}

const initialState = {
  data: null,
  setData: (_: QuestionData | null) => {},
};

export const QuestionContext = createContext<{
  data: QuestionData | null;

  setData: (data: QuestionData | null) => void;
}>(initialState);

export default function QuestionProvider({ children }: QuestionProviderProps) {
  const [data, setData] = useState<QuestionData | null>(null);

  const value = {
    data,
    setData,
  };

  return (
    <QuestionContext.Provider value={value}>
      {children}
    </QuestionContext.Provider>
  );
}
