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

        // Growth rate: Theil-Sen estimator on individual transactions.
        // Uses the median of all pairwise slopes so a handful of
        // high-value items (e.g. a $3,899 camera) can't skew the result.
        let growthRate = 0;
        if (acc.datedRevenues.length >= 6) {
            const points = acc.datedRevenues
                .map(({ date, revenue }) => ({
                    t: new Date(date).getTime(),
                    r: revenue,
                }))
                .filter(({ t }) => !isNaN(t));

            if (points.length >= 6) {
                const minT = Math.min(...points.map((p) => p.t));
                const maxT = Math.max(...points.map((p) => p.t));
                const span = maxT - minT;

                if (span > 0) {
                    // Normalise time to [0, 1]
                    const norm = points.map((p) => ({
                        x: (p.t - minT) / span,
                        y: p.r,
                    }));

                    // For large datasets, sample pairs to keep it fast
                    const slopes: number[] = [];
                    const maxPairs = 2000;
                    const allPairs = (norm.length * (norm.length - 1)) / 2;

                    if (allPairs <= maxPairs) {
                        for (let i = 0; i < norm.length; i++) {
                            for (let j = i + 1; j < norm.length; j++) {
                                const dx = norm[j].x - norm[i].x;
                                if (Math.abs(dx) > 1e-9) {
                                    slopes.push((norm[j].y - norm[i].y) / dx);
                                }
                            }
                        }
                    } else {
                        // Random sampling for larger datasets
                        for (let s = 0; s < maxPairs; s++) {
                            const i = Math.floor(Math.random() * norm.length);
                            let j = Math.floor(
                                Math.random() * (norm.length - 1),
                            );
                            if (j >= i) j++;
                            const dx = norm[j].x - norm[i].x;
                            if (Math.abs(dx) > 1e-9) {
                                slopes.push((norm[j].y - norm[i].y) / dx);
                            }
                        }
                    }

                    if (slopes.length > 0) {
                        slopes.sort((a, b) => a - b);
                        const medianSlope =
                            slopes[Math.floor(slopes.length / 2)];
                        const meanRev =
                            norm.reduce((s, p) => s + p.y, 0) / norm.length;
                        if (meanRev > 0) {
                            growthRate = (medianSlope / meanRev) * 100;
                        }
                    }
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
