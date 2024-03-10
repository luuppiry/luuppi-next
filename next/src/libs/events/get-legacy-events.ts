import { Event } from '@/models/event';
import { SupportedLanguage } from '@/models/locale';
import ical from 'node-ical';
import 'server-only';
import { logger } from '../utils/logger';

/**
 * Get events from Luuppi's legacy ICS calendar.
 * @param lang "fi" or "en
 * @returns Events from Luuppi's legacy ICS calendar
 */
export const getLuuppiEvents = async (
  lang: SupportedLanguage,
): Promise<Event[]> => {
  try {
    const langParam = lang === 'fi' ? 'fin' : 'eng';

    const res = await fetch(
      `https://luuppi.fi/service/ics/events.ics?lang=${langParam}`,
      {
        next: { revalidate: 300 },
      },
    );
    const data = await res.text();
    const eventsRaw = ical.parseICS(data);
    const events = Object.values(eventsRaw) as ical.VEvent[];

    const formattedEvents: Event[] = events.map((event) => ({
      title: event.summary,
      start: event.start,
      end: event.end,
      description: removeHtml(event.description) ?? '',
      id: getIdFromUrl(event.url ?? ''),
      location: event.location ?? '',
    }));

    return formattedEvents;
  } catch (error) {
    logger.error('Error fetching Luuppi events', error);
    return [];
  }
};

/**
 * Get event by ID from Luuppi's legacy ICS calendar.
 * @param lang "fi" or "en"
 * @param id Event ID
 * @returns Event from Luuppi's legacy ICS calendar
 */
export const getLuuppiEventById = async (
  lang: SupportedLanguage,
  id: string,
): Promise<Event | undefined> => {
  try {
    const langParam = lang === 'fi' ? 'fin' : 'eng';

    const res = await fetch(
      `https://luuppi.fi/service/ics/events.ics?lang=${langParam}`,
      {
        next: { revalidate: 300 },
      },
    );
    const data = await res.text();
    const eventsRaw = ical.parseICS(data);
    const events = Object.values(eventsRaw) as ical.VEvent[];

    const event = events.find((e) => e.url?.includes(`id=${id}`));
    if (!event) return undefined;

    const eventId = getIdFromUrl(event.url ?? '');

    return {
      title: event.summary,
      start: event.start,
      end: event.end,
      description: event.description ?? '',
      id: eventId,
      location: event.location ?? '',
    };
  } catch (error) {
    logger.error('Error fetching Luuppi event by ID', error);
    return undefined;
  }
};

/**
 * Get event ID from legacy ICS calendar URL.
 * @param url URL
 * @returns Event ID
 */
function getIdFromUrl(url: string) {
  return url.split('id=')[1];
}

/**
 * iha ok, mut ootko kattonu Luupin ICS sarjasta jakson himo siisti kalenteri :D siinä esiintyy koko html perhe
 * eli myös div-elementti fanit saavat nauraa ja naurattaahan se tietty myös vaikka ics speksin rikkominen ja muut :D
 * kannattaa kattoo nopee
 *
 * TODO: Remove this function when we our ics calendar has plaintext description and formatted description
 * as some non standard property: https://www.rfc-editor.org/rfc/rfc5545#section-3.8.8.2
 */
function removeHtml(text: string | undefined) {
  const removeHtml = text?.replace(/(<([^>]+)>)/gi, '');

  // Replace &auml; with ä, etc.
  const decodeHtml = removeHtml?.replace(/&([a-z0-9]+);/gi, (match, entity) => {
    const entities: Record<string, string> = {
      amp: '&',
      // eslint-disable-next-line quotes
      apos: "'",
      gt: '>',
      lt: '<',
      nbsp: ' ',
      quot: '"',
      ouml: 'ö',
      auml: 'ä',
      uuml: 'ü',
      Ouml: 'Ö',
      Auml: 'Ä',
      Uuml: 'Ü',
      aring: 'å',
      Aring: 'Å',
    };
    return entities[entity] ?? match;
  });
  return decodeHtml;
}
