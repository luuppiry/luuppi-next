'use client';
import { eventExport } from '@/actions/admin/event-export';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import React from 'react';
import { PiCheckCircle, PiCircle } from 'react-icons/pi';

interface AdminEventRegistrationsListProps {
  dictionary: Dictionary;
  eventId: number;
  lang: SupportedLanguage;
  requiresPickup: boolean;
}

type ParsedExport = {
  metadata: Record<string, string>;
  headers: string[];
  rows: Record<string, string>[];
};

function parseEventExportCsv(input: string): ParsedExport {
  const normalized = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  // Find the first completely empty line -> metadata ends there.
  const firstBlankIdx = lines.findIndex((l) => l.trim() === '');
  const metadataLines = firstBlankIdx === -1 ? [] : lines.slice(0, firstBlankIdx);

  // Skip blank lines after metadata to find CSV header line index
  let csvStart = firstBlankIdx === -1 ? 0 : firstBlankIdx;
  while (csvStart < lines.length && lines[csvStart].trim() === '') csvStart++;

  const csvText = lines.slice(csvStart).join('\n').trim();
  if (!csvText) {
    return { metadata: parseMetadata(metadataLines), headers: [], rows: [] };
  }

  const records = parseCsv(csvText);
  if (records.length === 0) {
    return { metadata: parseMetadata(metadataLines), headers: [], rows: [] };
  }

  const headers = records[0];
  const rows = records.slice(1).map((values) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = values[i] ?? '';
    }
    return obj;
  });

  return { metadata: parseMetadata(metadataLines), headers, rows };
}

function parseMetadata(lines: string[]): Record<string, string> {
  const meta: Record<string, string> = {};
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key) meta[key] = val;
  }
  return meta;
}

/**
 * Robust-ish CSV parser:
 * - supports quoted fields with commas, quotes (""), and newlines
 * - returns array of records, each record is array of field strings
 */
function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let i = 0;
  let inQuotes = false;

  while (i < csv.length) {
    const c = csv[i];

    if (inQuotes) {
      if (c === '"') {
        // Escaped quote
        if (csv[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        // End quote
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }

    // not in quotes
    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (c === ',') {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }

    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
      continue;
    }

    field += c;
    i += 1;
  }

  // flush last field/row
  row.push(field);
  rows.push(row);

  // Trim possible trailing empty last row (common when ending with newline)
  while (rows.length > 0 && rows[rows.length - 1].every((v) => v === '')) {
    rows.pop();
  }

  return rows;
}

export default function AdminEventRegistrationsList({
  dictionary,
  eventId,
  lang,
  requiresPickup,
}: AdminEventRegistrationsListProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<ParsedExport | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await eventExport(lang, eventId);
        if (cancelled) return;

        if (response.isError || !response.data) {
          setError(response.message ?? dictionary.general.error ?? 'Error');
          setData({ metadata: {}, headers: [], rows: [] });
          return;
        }

        const parsed = parseEventExportCsv(String(response.data));
        setData(parsed);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? (dictionary.general.error ?? 'Error'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dictionary.general.error, eventId, lang]);

  const rows = React.useMemo(() => {
    const r = data?.rows ?? [];
    const emailKey = dictionary.general.email.toUpperCase();

    return [...r].sort((a, b) => (a[emailKey] ?? '').localeCompare(b[emailKey] ?? ''));
  }, [data?.rows, dictionary.general.email]);

  const baseKeys = React.useMemo(() => {
    return new Set([
      dictionary.general.created_at.toUpperCase(),
      dictionary.general.username.toUpperCase(),
      dictionary.general.email.toUpperCase(),
      dictionary.general.firstNames.toUpperCase(),
      dictionary.general.lastName.toUpperCase(),
      dictionary.general.preferredFullName.toUpperCase(),
      dictionary.general.paid.toUpperCase(),
      dictionary.general.quota.toUpperCase(),
      (dictionary.pages_admin.picked_up ?? 'Picked up').toUpperCase(),
    ]);
  }, [dictionary]);

  const hasAnswers = React.useMemo(() => {
    if (!data?.headers?.length) return false;
    const answerKeys = data.headers.filter((h) => !baseKeys.has(h));
    if (answerKeys.length === 0) return false;

    // show answers column only if at least one row has some answer content
    return rows.some((r) => answerKeys.some((k) => (r[k] ?? '').trim() !== ''));
  }, [baseKeys, data?.headers, rows]);

  const pickedUpCount = React.useMemo(() => {
    if (!requiresPickup) return 0;
    const pickedUpKey = (dictionary.pages_admin.picked_up ?? 'Picked up').toUpperCase();
    const yes = (dictionary.general.yes ?? 'Yes').toLowerCase();

    return rows.filter((r) => (r[pickedUpKey] ?? '').toLowerCase() === yes).length;
  }, [dictionary, requiresPickup, rows]);

  const pickedUpLabel = dictionary.pages_admin.picked_up;

  if (loading) {
    return (
      <div className="card card-body">
        <p className="text-sm text-gray-500">{dictionary.general.loading ?? 'Loading…'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card card-body">
        <p className="text-sm text-error">{error}</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="card card-body">
        <p className="text-sm">{dictionary.general.no_registrations}</p>
      </div>
    );
  }

  const emailKey = dictionary.general.email.toUpperCase();
  const firstNamesKey = dictionary.general.firstNames.toUpperCase();
  const lastNameKey = dictionary.general.lastName.toUpperCase();
  const pickedUpKey = (dictionary.pages_admin.picked_up ?? 'Picked up').toUpperCase();
  const yes = (dictionary.general.yes ?? 'Yes').toLowerCase();

  const answerKeys = (data?.headers ?? []).filter((h) => !baseKeys.has(h));

  return (
    <div className="card card-body">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{dictionary.general.registrations}</h2>

        {requiresPickup && (
          <div className="flex gap-2">
            <span className="badge badge-primary">
              {dictionary.pages_admin.picked_up}: {pickedUpCount} / {rows.length}
            </span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>{dictionary.general.email}</th>
              <th>{dictionary.general.firstNames}</th>
              <th>{dictionary.general.lastName}</th>

              {hasAnswers && <th>{dictionary.pages_admin.registration_answers}</th>}

              {requiresPickup && (
                <th>
                  <span className="flex justify-center">{pickedUpLabel}</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="[&>*:nth-child(odd)]:bg-primary-50">
            {rows.map((r, index) => {
              const pickedUp = (r[pickedUpKey] ?? '').toLowerCase() === yes;

              // Build answers list the same “question -> answer” shape your old component expects
              const answers = answerKeys
                .map((k) => ({
                  question: k, // already uppercased header; if you want original case, stop uppercasing headers in export
                  answer: r[k] ?? '',
                }))
                .filter((a) => (a.answer ?? '').trim() !== '');

              return (
                <React.Fragment key={`${r[emailKey] ?? 'row'}-${index}`}>
                  <tr>
                    <th>{index + 1}</th>
                    <td>{r[emailKey] || '-'}</td>
                    <td>{r[firstNamesKey] || '-'}</td>
                    <td>{r[lastNameKey] || '-'}</td>

                    {hasAnswers && (
                      <td>
                        {answers.length > 0 ? (
                          <div
                            className="grid gap-4 rounded-md border border-gray-200 bg-white p-3"
                            style={{
                              gridTemplateColumns: `repeat(${answers.length}, minmax(0, 1fr))`,
                            }}
                          >
                            {answers.map((a) => (
                              <div key={a.question} className="flex flex-col">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  {a.question}
                                </span>
                                <span className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                                  {a.answer || '-'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">–</span>
                        )}
                      </td>
                    )}
                    {requiresPickup && (
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          {pickedUp ? (
                            <PiCheckCircle className="text-success" size={20} />
                          ) : (
                            <PiCircle className="text-gray-400" size={20} />
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
