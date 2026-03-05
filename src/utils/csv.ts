const CRLF = '\r\n';

/** Quote a single CSV field, escaping internal double-quotes. */
function quoteField(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

/** Join fields into a quoted CSV row (AnyTone CPS requires every field double-quoted). */
export function csvRow(fields: (string | number)[]): string {
  return fields.map(quoteField).join(',');
}

/**
 * Build a complete CSV string from a header row and data rows (quoted).
 * Lines are separated by CRLF, with a trailing CRLF.
 */
export function buildCsv(
  header: (string | number)[],
  rows: (string | number)[][],
): string {
  return [csvRow(header), ...rows.map(csvRow)].join(CRLF) + CRLF;
}

/** Join fields into an unquoted CSV row (for CHIRP, which exports plain CSV). */
function csvRowPlain(fields: (string | number)[]): string {
  return fields.map(String).join(',');
}

/**
 * Build a complete CSV string without quoting (CHIRP format).
 * Lines are separated by CRLF, with a trailing CRLF.
 */
export function buildCsvPlain(
  header: (string | number)[],
  rows: (string | number)[][],
): string {
  return [csvRowPlain(header), ...rows.map(csvRowPlain)].join(CRLF) + CRLF;
}
