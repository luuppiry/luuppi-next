export interface Event {
  /* Used for the event calendar, documentId */
  id: string;
  title: string;
  description: string;
  slug: string;
  start: Date;
  end: Date;
  location: string;
  hasTickets: boolean;
}
