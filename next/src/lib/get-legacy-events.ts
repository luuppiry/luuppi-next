import { Event } from '@/models/event';
import { SupportedLanguage } from '@/models/locale';
import ical from 'node-ical';

/**
 * Temporary function to get events from Luuppi's legacy calendar.
 * TODO: Replace this with a logic that gets events from the new calendar.
 */
export default async function getLuuppiEvents(
  lang: SupportedLanguage,
): Promise<Event[]> {
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
  }));

  return formattedEvents;
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
