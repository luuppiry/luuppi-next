'use client';
import { ReactNode, createContext, useState } from 'react';

interface EventSelectorProviderProps {
  children: ReactNode;
}

const initialState = {
  selectedView: 'calendar',
  activeCalendarMonth: new Date(),
  desktopCalendarFullSize: false,
  setView: (_: 'calendar' | 'list') => {},
  setActiveCalendarMonth: (_: Date) => {},
  setDesktopCalendarFullSize: (_: boolean) => {},
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
  const [activeCalendarMonth, setActiveCalendarMonth] = useState(new Date());
  const [desktopCalendarFullSize, setDesktopCalendarFullSize] = useState(false);

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
    activeCalendarMonth,
    setActiveCalendarMonth,
    desktopCalendarFullSize,
    setDesktopCalendarFullSize,
  };

  return (
    <SelectedViewContext.Provider value={value}>
      {children}
    </SelectedViewContext.Provider>
  );
}
