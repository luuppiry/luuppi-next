'use client';
import { ReactNode, createContext, useState } from 'react';

interface EventSelectorProviderProps {
  children: ReactNode;
}

const initialState = {
  selectedView: 'calendar',
  mobileCalendarMonth: new Date(),
  // eslint-disable-next-line no-unused-vars
  setView: (_: 'calendar' | 'list') => {},
  // eslint-disable-next-line no-unused-vars
  setMobileCalendarMonth: (_: Date) => {},
  showPastEvents: false,
  toggleShowPastEvents: () => {},
};

export const SelectedViewContext =
  createContext<typeof initialState>(initialState);

export default function EventSelectorProvider({
  children,
}: EventSelectorProviderProps) {
  const [selectedView, setSelectedView] = useState<'calendar' | 'list'>(
    'calendar',
  );
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [mobileCalendarMonth, setMobileCalendarMonth] = useState(new Date());

  const setView = (view: 'calendar' | 'list') => {
    setSelectedView(view);
  };

  const toggleShowPastEvents = () => {
    setShowPastEvents(!showPastEvents);
  };

  const value = {
    selectedView,
    setView,
    showPastEvents,
    toggleShowPastEvents,
    mobileCalendarMonth,
    setMobileCalendarMonth,
  };

  return (
    <SelectedViewContext.Provider value={value}>
      {children}
    </SelectedViewContext.Provider>
  );
}
