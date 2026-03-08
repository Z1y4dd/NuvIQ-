import type { BundleData } from "./data";

/**
 * Computes product association rules (market basket analysis) using the
 * Apriori algorithm. No AI — runs deterministically over all rows.
 *
 * Grouping strategy (first that produces multi-item baskets wins):
 * 1. Invoice ID — classic per-transaction basket
 * 2. Customer ID — cross-purchase patterns per customer
 * 3. Date — products sold on the same day (daily co-occurrence)
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
    const dateIdx = headerMap["date"];

    if (invoiceIdx === undefined || productIdx === undefined) {
        return [];
    }

    const dataRows = content.slice(1);

    // Try grouping strategies in order of specificity
    const strategies: { idx: number; label: string }[] = [
        { idx: invoiceIdx, label: "invoice" },
    ];
    if (customerIdx !== undefined) {
        strategies.push({ idx: customerIdx, label: "customer" });
    }
    if (dateIdx !== undefined) {
        strategies.push({ idx: dateIdx, label: "date" });
    }

    for (const { idx } of strategies) {
        const baskets = buildBaskets(dataRows, idx, productIdx);
        const rules = apriori(baskets);
        if (rules.length > 0) return rules;
    }

    return [];
}

/** Group rows into baskets keyed by a grouping column. */
function buildBaskets(
    dataRows: string[][],
    groupIdx: number,
    productIdx: number,
): Map<string, Set<string>> {
    const baskets = new Map<string, Set<string>>();
    for (const row of dataRows) {
        let groupKey = row[groupIdx]?.trim();
        const product = row[productIdx]?.trim();
        if (!groupKey || !product) continue;

        // Normalize date-like keys to YYYY-MM-DD (strip time portions)
        groupKey = normalizeDateKey(groupKey);

        let basket = baskets.get(groupKey);
        if (!basket) {
            basket = new Set<string>();
            baskets.set(groupKey, basket);
        }
        basket.add(product);
    }
    return baskets;
}

/** Strip time portion from date-like strings so same-day rows group together. */
function normalizeDateKey(key: string): string {
    // ISO datetime: "2024-01-15T10:30:00" or "2024-01-15 10:30:00"
    const isoMatch = key.match(/^(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/);
    if (isoMatch) return isoMatch[1];
    // US/EU date with time: "01/15/2024 10:30"
    const slashMatch = key.match(/^(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/);
    if (slashMatch) return slashMatch[1];
    return key;
}

/** Run Apriori on pre-built baskets and return top association rules. */
function apriori(baskets: Map<string, Set<string>>): BundleData[] {
    // Remove single-item baskets — they can't produce pairs
    const multiBaskets: Set<string>[] = [];
    for (const basket of baskets.values()) {
        if (basket.size > 1) multiBaskets.push(basket);
    }

    const totalTransactions = multiBaskets.length;
    if (totalTransactions < 1) return [];

    // Count individual product frequencies within multi-item baskets
    const productCount = new Map<string, number>();
    for (const basket of multiBaskets) {
        for (const product of basket) {
            productCount.set(product, (productCount.get(product) || 0) + 1);
        }
    }

    // All products that appear at least once are candidates
    const frequentItems = [...productCount.keys()];

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

    // Generate association rules from all co-occurring pairs
    const rules: BundleData[] = [];
    for (const [key, coCount] of pairCount) {
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
