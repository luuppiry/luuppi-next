const TARGET_UID = "api::event.event";
const HELSINKI_TZ = "Europe/Helsinki";

function getOffsetMinutes(timeZone: string, date = new Date()) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date).reduce(
    (acc, p) => {
      acc[p.type] = p.value;
      return acc;
    },
    {} as Record<string, string>,
  );

  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return (asUTC - date.getTime()) / 60000;
}

const TimezoneOffsetPanel = ({ model }: { model: string }) => {
  if (model !== TARGET_UID) return null;

  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (userTz === HELSINKI_TZ) return null;

  const diffMinutes = getOffsetMinutes(HELSINKI_TZ) - getOffsetMinutes(userTz);
  if (diffMinutes === 0) return null;

  const hours = Math.round(diffMinutes / 60);
  const sign = hours > 0 ? "+" : "";
  const label = `Helsinki is ${sign}${hours}h relative to your local time (${userTz}), luuppi.fi uses Finnish time.`;

  return {
    title: "WRONG TIMEZONE ‼️",
    content: (
      <div>
        <p>{label}</p>
      </div>
    ),
  };
};

export default TimezoneOffsetPanel;
