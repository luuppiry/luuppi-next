/**
 * iha ok, mut ootko kattonu Luupin ICS sarjasta jakson himo siisti kalenteri :D siinä esiintyy koko html perhe
 * eli myös div-elementti fanit saavat nauraa ja naurattaahan se tietty myös vaikka ics speksin rikkominen ja muut :D
 * kannattaa kattoo nopee
 *
 * TODO: Remove this function when we our ics calendar has plaintext description and formatted description
 * as some non standard property: https://www.rfc-editor.org/rfc/rfc5545#section-3.8.8.2
 */

export default function removeHtml(text: string | undefined) {
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
