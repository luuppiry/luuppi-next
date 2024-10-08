export interface Event {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  location: string;
  hasTickets: boolean;
}
