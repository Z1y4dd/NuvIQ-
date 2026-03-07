import type { BundleData } from "./data";

/**
 * Computes product association rules (market basket analysis) using the
 * Apriori algorithm. No AI — runs deterministically over all rows.
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

    if (invoiceIdx === undefined || productIdx === undefined) {
        return [];
    }

    // Step 1: Group rows into transaction baskets keyed by invoice ID
    const baskets = new Map<string, Set<string>>();
    const dataRows = content.slice(1);

    for (const row of dataRows) {
        const invoiceId = row[invoiceIdx]?.trim();
        const product = row[productIdx]?.trim();
        if (!invoiceId || !product) continue;

        let basket = baskets.get(invoiceId);
        if (!basket) {
            basket = new Set<string>();
            baskets.set(invoiceId, basket);
        }
        basket.add(product);
    }

    const totalTransactions = baskets.size;
    if (totalTransactions < 2) return [];

    // Step 2: Count individual product frequencies
    const productCount = new Map<string, number>();
    for (const basket of baskets.values()) {
        for (const product of basket) {
            productCount.set(product, (productCount.get(product) || 0) + 1);
        }
    }

    // Step 3: Adaptive minimum support — at least 2 transactions, or 0.5% of total
    const minSupportCount = Math.max(2, Math.ceil(totalTransactions * 0.005));

    // Filter to frequent single items
    const frequentItems: string[] = [];
    for (const [product, count] of productCount) {
        if (count >= minSupportCount) {
            frequentItems.push(product);
        }
    }

    // Step 4: Count pairwise co-occurrences (frequent 2-itemsets)
    const pairCount = new Map<string, number>();

    for (const basket of baskets.values()) {
        // Intersect with frequent items for efficiency
        const items = frequentItems.filter((item) => basket.has(item));
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const key = pairKey(items[i], items[j]);
                pairCount.set(key, (pairCount.get(key) || 0) + 1);
            }
        }
    }

    // Step 5: Generate association rules from frequent pairs
    const rules: BundleData[] = [];

    for (const [key, coCount] of pairCount) {
        if (coCount < minSupportCount) continue;

        const [a, b] = key.split("\0");
        const countA = productCount.get(a) || 0;
        const countB = productCount.get(b) || 0;
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

    // Step 6: Sort by lift descending, take top 15
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
