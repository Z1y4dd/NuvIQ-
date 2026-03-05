/**
 * Extracts a sample of CSV data from the stored content, using the header map
 * to select only the mapped columns, and formats it as a readable CSV string
 * suitable for sending to an AI prompt.
 *
 * @param content   The full parsed CSV content (string[][]) including headers at index 0.
 * @param headerMap Map of required-column-name → column-index (e.g. { "date": 0, "total revenue": 3 }).
 * @param maxRows   Maximum number of data rows to include (default 200). Header row is always included.
 */
export function extractCsvSample(
    content: string[][],
    headerMap: Record<string, number>,
    maxRows: number = 200,
): string {
    if (!content || content.length === 0) {
        return "";
    }

    const originalHeaders = content[0];
    const mappedEntries = Object.entries(headerMap);

    // Build the header row using the standardised names
    const headerRow = mappedEntries.map(([name]) => name);

    // Build data rows, picking only the mapped column indices
    const dataRows = content.slice(1, 1 + maxRows).map((row) =>
        mappedEntries.map(([, colIdx]) => {
            const value = row[colIdx] ?? "";
            // Wrap in quotes if value contains commas or quotes
            if (value.includes(",") || value.includes('"')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }),
    );

    const lines = [headerRow.join(","), ...dataRows.map((r) => r.join(","))];
    return lines.join("\n");
}
