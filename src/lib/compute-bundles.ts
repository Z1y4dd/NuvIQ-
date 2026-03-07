import type { BundleData } from "./data";

/**
 * Computes product association rules (market basket analysis) using the
 * Apriori algorithm. No AI — runs deterministically over all rows.
 *
 * Groups by invoice ID first. If most invoices contain only one product,
 * falls back to grouping by customer ID to find cross-purchase patterns.
 *
 * @param content   Full parsed CSV (string[][]) with headers at index 0.
 * @param headerMap Map of column-name → column-index.
 * @returns Top association rules sorted by lift descending.
 */
export function computeBundles(
    content: string[][],
    headerMap: Record<string, number>,
): BundleData[] {
    const invoiceIdx = headerMap["invoiceid"];
    const productIdx = headerMap["product name"];
    const customerIdx = headerMap["customer id"];

    if (invoiceIdx === undefined || productIdx === undefined) {
        return [];
    }

    const dataRows = content.slice(1);

    // Step 1: Group rows into baskets keyed by invoice ID
    const invoiceBaskets = buildBaskets(dataRows, invoiceIdx, productIdx);

    // Check if invoices have multi-product baskets
    let multiItemBaskets = 0;
    for (const basket of invoiceBaskets.values()) {
        if (basket.size > 1) multiItemBaskets++;
    }

    let baskets: Map<string, Set<string>>;

    if (multiItemBaskets >= 2) {
        // Enough multi-product invoices — use invoice-level baskets
        baskets = invoiceBaskets;
    } else if (customerIdx !== undefined) {
        // Fall back to customer-level baskets (cross-purchase analysis)
        baskets = buildBaskets(dataRows, customerIdx, productIdx);
    } else {
        // No customer ID column — still use invoice baskets (may return few/no rules)
        baskets = invoiceBaskets;
    }

    return apriori(baskets);
}

/** Group rows into baskets keyed by a grouping column. */
function buildBaskets(
    dataRows: string[][],
    groupIdx: number,
    productIdx: number,
): Map<string, Set<string>> {
    const baskets = new Map<string, Set<string>>();
    for (const row of dataRows) {
        const groupKey = row[groupIdx]?.trim();
        const product = row[productIdx]?.trim();
        if (!groupKey || !product) continue;

        let basket = baskets.get(groupKey);
        if (!basket) {
            basket = new Set<string>();
            baskets.set(groupKey, basket);
        }
        basket.add(product);
    }
    return baskets;
}

/** Run Apriori on pre-built baskets and return top association rules. */
function apriori(baskets: Map<string, Set<string>>): BundleData[] {
    // Remove single-item baskets — they can't produce pairs
    const multiBaskets: Set<string>[] = [];
    for (const basket of baskets.values()) {
        if (basket.size > 1) multiBaskets.push(basket);
    }

    const totalTransactions = multiBaskets.length;
    if (totalTransactions < 2) return [];

    // Count individual product frequencies within multi-item baskets
    const productCount = new Map<string, number>();
    for (const basket of multiBaskets) {
        for (const product of basket) {
            productCount.set(product, (productCount.get(product) || 0) + 1);
        }
    }

    // Minimum support: at least 2 co-occurrences
    const minSupportCount = 2;

    // Keep items that appear in at least minSupportCount baskets
    const frequentItems: string[] = [];
    for (const [product, count] of productCount) {
        if (count >= minSupportCount) {
            frequentItems.push(product);
        }
    }

    // Count pairwise co-occurrences
    const pairCount = new Map<string, number>();
    for (const basket of multiBaskets) {
        const items = frequentItems.filter((item) => basket.has(item));
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const key = pairKey(items[i], items[j]);
                pairCount.set(key, (pairCount.get(key) || 0) + 1);
            }
        }
    }

    // Generate association rules from pairs that co-occur at least twice
    const rules: BundleData[] = [];
    for (const [key, coCount] of pairCount) {
        if (coCount < minSupportCount) continue;

        const [a, b] = key.split("\0");
        const countA = productCount.get(a) || 1;
        const countB = productCount.get(b) || 1;
        const support = coCount / totalTransactions;

        // Rule A → B
        const confidenceAB = coCount / countA;
        const liftAB = confidenceAB / (countB / totalTransactions);
        rules.push({
            antecedents: [a],
            consequents: [b],
            support: round4(support),
            confidence: round4(confidenceAB),
            lift: round4(liftAB),
        });

        // Rule B → A
        const confidenceBA = coCount / countB;
        const liftBA = confidenceBA / (countA / totalTransactions);
        rules.push({
            antecedents: [b],
            consequents: [a],
            support: round4(support),
            confidence: round4(confidenceBA),
            lift: round4(liftBA),
        });
    }

    rules.sort((a, b) => b.lift - a.lift);
    return rules.slice(0, 15);
}

/** Canonical key for an unordered pair (always alphabetical). */
function pairKey(a: string, b: string): string {
    return a < b ? `${a}\0${b}` : `${b}\0${a}`;
}

function round4(n: number): number {
    return Math.round(n * 10000) / 10000;
}
