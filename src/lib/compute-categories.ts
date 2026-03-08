import type { CategoryData } from "./data";

/**
 * Computes category performance deterministically from the full dataset.
 * No AI — runs instantly over all rows.
 *
 * @param content   Full parsed CSV (string[][]) with headers at index 0.
 * @param headerMap Map of column-name → column-index.
 * @returns CategoryData[] sorted by totalRevenue descending.
 */
export function computeCategories(
    content: string[][],
    headerMap: Record<string, number>,
): CategoryData[] {
    const categoryIdx = headerMap["category"];
    const revenueIdx = headerMap["total revenue"];
    const quantityIdx = headerMap["quantity"];
    const productIdx = headerMap["product name"];
    const dateIdx = headerMap["date"];

    if (categoryIdx === undefined) return [];

    const dataRows = content.slice(1);

    // Step 1: Parse all dates to find the midpoint for growth calculation
    const dates: string[] = [];
    if (dateIdx !== undefined) {
        for (const row of dataRows) {
            const d = normalizeDate(row[dateIdx]?.trim());
            if (d) dates.push(d);
        }
    }
    dates.sort();
    const midDate =
        dates.length > 0 ? dates[Math.floor(dates.length / 2)] : null;

    // Step 2: Accumulate per-category stats
    interface CategoryAccum {
        totalRevenue: number;
        totalUnits: number;
        firstHalfRevenue: number;
        secondHalfRevenue: number;
        productRevenue: Map<string, number>;
    }

    const categories = new Map<string, CategoryAccum>();

    for (const row of dataRows) {
        const cat = row[categoryIdx]?.trim();
        if (!cat) continue;

        let acc = categories.get(cat);
        if (!acc) {
            acc = {
                totalRevenue: 0,
                totalUnits: 0,
                firstHalfRevenue: 0,
                secondHalfRevenue: 0,
                productRevenue: new Map(),
            };
            categories.set(cat, acc);
        }

        // Revenue
        const revenue =
            revenueIdx !== undefined
                ? parseFloat(row[revenueIdx]?.replace(/[^0-9.\-]/g, "") ?? "")
                : 0;
        if (!isNaN(revenue)) acc.totalRevenue += revenue;

        // Units
        if (quantityIdx !== undefined) {
            const qty = parseFloat(row[quantityIdx] ?? "");
            acc.totalUnits += isNaN(qty) ? 1 : qty;
        } else {
            acc.totalUnits += 1; // count rows if no quantity column
        }

        // Product revenue tracking for top product
        if (productIdx !== undefined && !isNaN(revenue)) {
            const product = row[productIdx]?.trim();
            if (product) {
                acc.productRevenue.set(
                    product,
                    (acc.productRevenue.get(product) || 0) + revenue,
                );
            }
        }

        // Growth: first half vs second half
        if (dateIdx !== undefined && midDate && !isNaN(revenue)) {
            const d = normalizeDate(row[dateIdx]?.trim());
            if (d) {
                if (d <= midDate) {
                    acc.firstHalfRevenue += revenue;
                } else {
                    acc.secondHalfRevenue += revenue;
                }
            }
        }
    }

    // Step 3: Build CategoryData results
    const results: CategoryData[] = [];
    for (const [name, acc] of categories) {
        // Find top product
        let topProduct = "N/A";
        let topProductRevenue = -1;
        for (const [product, rev] of acc.productRevenue) {
            if (rev > topProductRevenue) {
                topProductRevenue = rev;
                topProduct = product;
            }
        }

        // Growth rate: (secondHalf - firstHalf) / firstHalf * 100
        let growthRate = 0;
        if (acc.firstHalfRevenue > 0) {
            growthRate =
                ((acc.secondHalfRevenue - acc.firstHalfRevenue) /
                    acc.firstHalfRevenue) *
                100;
        } else if (acc.secondHalfRevenue > 0) {
            growthRate = 100; // went from 0 to something
        }

        results.push({
            categoryName: name,
            totalRevenue: round2(acc.totalRevenue),
            totalUnitsSold: Math.round(acc.totalUnits),
            topProduct,
            growthRate: round1(growthRate),
        });
    }

    // Sort by revenue descending
    results.sort((a, b) => b.totalRevenue - a.totalRevenue);
    return results;
}

/** Normalise various date formats to YYYY-MM-DD for comparison. */
function normalizeDate(raw: string | undefined): string | null {
    if (!raw) return null;

    // ISO: 2024-01-15 or 2024/01/15 (possibly with time)
    const isoMatch = raw.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
    }

    // US: MM/DD/YYYY or MM-DD-YYYY
    const usMatch = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (usMatch) {
        return `${usMatch[3]}-${usMatch[1].padStart(2, "0")}-${usMatch[2].padStart(2, "0")}`;
    }

    // Fallback
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
    }
    return null;
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

function round1(n: number): number {
    return Math.round(n * 10) / 10;
}
