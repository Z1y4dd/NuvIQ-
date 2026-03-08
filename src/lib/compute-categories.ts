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

    // Accumulate per-category stats
    interface CategoryAccum {
        totalRevenue: number;
        totalUnits: number;
        productRevenue: Map<string, number>;
        datedRevenues: { date: string; revenue: number }[];
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
                productRevenue: new Map(),
                datedRevenues: [],
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

        // Track dated revenues for per-category growth calculation
        if (dateIdx !== undefined && !isNaN(revenue)) {
            const d = normalizeDate(row[dateIdx]?.trim());
            if (d) {
                acc.datedRevenues.push({ date: d, revenue });
            }
        }
    }

    // Build CategoryData results
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

        // Growth rate: use linear regression on monthly revenue to find
        // a robust trend that isn't dominated by single-month outliers.
        let growthRate = 0;
        if (acc.datedRevenues.length >= 2) {
            const monthlyRevenue = new Map<string, number>();
            for (const { date, revenue } of acc.datedRevenues) {
                const month = date.slice(0, 7); // "YYYY-MM"
                monthlyRevenue.set(
                    month,
                    (monthlyRevenue.get(month) || 0) + revenue,
                );
            }
            const sortedMonths = [...monthlyRevenue.entries()].sort((a, b) =>
                a[0].localeCompare(b[0]),
            );

            if (sortedMonths.length >= 2) {
                // Linear regression: y = revenue, x = month index (0, 1, 2…)
                const n = sortedMonths.length;
                const revenues = sortedMonths.map(([, r]) => r);
                const meanX = (n - 1) / 2;
                const meanY = revenues.reduce((s, r) => s + r, 0) / n;

                let num = 0;
                let den = 0;
                for (let i = 0; i < n; i++) {
                    num += (i - meanX) * (revenues[i] - meanY);
                    den += (i - meanX) * (i - meanX);
                }

                if (den > 0 && meanY > 0) {
                    const slope = num / den; // revenue change per month
                    // Express as % change over the full span relative to mean
                    growthRate = ((slope * (n - 1)) / meanY) * 100;
                }
            }
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
