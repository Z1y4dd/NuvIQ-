"use client";

// CSV parsing utility (no Firebase Storage needed)

export async function parseCSV(
    file: File,
): Promise<{ headers: string[]; data: string[][] }> {
    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
        throw new Error("CSV file is empty");
    }

    const headers = lines[0].split(",").map((h) => h.trim());
    const data = lines
        .slice(1)
        .map((line) => line.split(",").map((cell) => cell.trim()));

    return { headers, data };
}
