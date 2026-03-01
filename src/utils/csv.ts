const CRLF = '\r\n';

/** Join fields into a CSV row (no quoting). */
export function csvRow(fields: (string | number)[]): string {
  return fields.map(String).join(',');
}

/**
 * Build a complete CSV string from a header row and data rows.
 * Lines are separated by CRLF.
 */
export function buildCsv(
  header: (string | number)[],
  rows: (string | number)[][],
): string {
  return [csvRow(header), ...rows.map(csvRow)].join(CRLF);
}
