// The workshop is in Melbourne. Dates arrive as UTC instants (local midnight
// becomes the previous day in UTC), so the server, which runs on UTC, must read
// the month in shop time or records dated the 1st land in the previous month.
const SHOP_TIME_ZONE = "Australia/Melbourne";

const formatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: SHOP_TIME_ZONE,
  year: "numeric",
  month: "numeric",
});

export function shopMonthYear(date: Date): { month: number; year: number } {
  const parts = formatter.formatToParts(date);
  const get = (type: "month" | "year") =>
    Number(parts.find((part) => part.type === type)?.value);
  return { month: get("month"), year: get("year") };
}
