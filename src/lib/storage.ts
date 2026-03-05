"use client";

// RFC 4180-compliant CSV parser
// Handles: quoted fields, embedded commas, escaped quotes (""), \r\n line endings

export async function parseCSV(
    file: File,
): Promise<{ headers: string[]; data: string[][] }> {
    const text = await file.text();
    const rows = parseCSVString(text);

    if (rows.length === 0) {
        throw new Error("CSV file is empty");
    }

    const headers = rows[0].map((h) => h.trim());
    const data = rows.slice(1);

    return { headers, data };
}

/**
 * Parses a CSV string into a 2D array of strings, correctly handling:
 * - Quoted fields containing commas, newlines, and double-quotes
 * - CRLF and LF line endings
 * - Escaped double-quotes (doubled: "")
 */
function parseCSVString(text: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = "";
    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
        const char = text[i];

        if (inQuotes) {
            if (char === '"') {
                // Look ahead: escaped quote ("") or end of quoted field
                if (i + 1 < text.length && text[i + 1] === '"') {
                    currentField += '"';
                    i += 2;
                } else {
                    // End of quoted field
                    inQuotes = false;
                    i++;
                }
            } else {
                currentField += char;
                i++;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
                i++;
            } else if (char === ",") {
                currentRow.push(currentField.trim());
                currentField = "";
                i++;
            } else if (char === "\r") {
                // Handle \r\n or standalone \r
                currentRow.push(currentField.trim());
                currentField = "";
                if (currentRow.length > 0 && currentRow.some((c) => c !== "")) {
                    rows.push(currentRow);
                }
                currentRow = [];
                i++;
                if (i < text.length && text[i] === "\n") {
                    i++;
                }
            } else if (char === "\n") {
                currentRow.push(currentField.trim());
                currentField = "";
                if (currentRow.length > 0 && currentRow.some((c) => c !== "")) {
                    rows.push(currentRow);
                }
                currentRow = [];
                i++;
            } else {
                currentField += char;
                i++;
            }
        }
    }

    // Handle last field/row (no trailing newline)
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some((c) => c !== "")) {
            rows.push(currentRow);
        }
    }

    return rows;
}
