import type { KpiData } from "./data";

/**
 * Computes KPIs deterministically from the full dataset using pure arithmetic.
 * No AI / network calls — runs instantly on all rows.
 *
 * @param content   The full parsed CSV content (string[][]) with headers at index 0.
 * @param headerMap Map of column-name → column-index (e.g. { "date": 0, "total revenue": 3 }).
 * @returns An array of 4 KpiData objects ready to store in Firestore.
 */
export function computeKpis(
    content: string[][],
    headerMap: Record<string, number>,
): KpiData[] {
    const dataRows = content.slice(1); // skip header row

    const revenueIdx = headerMap["total revenue"];
    const invoiceIdx = headerMap["invoiceid"];
    const quantityIdx = headerMap["quantity"];
    const customerIdx = headerMap["customer id"];

    let totalRevenue = 0;
    const invoiceIds = new Set<string>();
    const customerIds = new Set<string>();
    let totalQuantity = 0;
    let quantityRowCount = 0;

    for (const row of dataRows) {
        // Revenue
        if (revenueIdx !== undefined) {
            const val = parseFloat(row[revenueIdx]);
            if (!isNaN(val)) totalRevenue += val;
        }

        // Unique invoices
        if (invoiceIdx !== undefined) {
            const id = row[invoiceIdx]?.trim();
            if (id) invoiceIds.add(id);
        }

        // Unique customers
        if (customerIdx !== undefined) {
            const id = row[customerIdx]?.trim();
            if (id) customerIds.add(id);
        }

        // Quantity
        if (quantityIdx !== undefined) {
            const val = parseFloat(row[quantityIdx]);
            if (!isNaN(val)) {
                totalQuantity += val;
                quantityRowCount++;
            }
        }
    }

    const totalTransactions = invoiceIds.size || 1; // avoid divide-by-zero
    const uniqueCustomers =
        customerIdx !== undefined ? customerIds.size : invoiceIds.size;

    const avgItemsPerOrder =
        quantityIdx !== undefined && quantityRowCount > 0
            ? totalQuantity / totalTransactions
            : dataRows.length / totalTransactions;

    return [
        {
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            icon: "DollarSign",
            description: "Revenue generated from all sales during the period.",
            change: "",
        },
        {
            title: "Total Transactions",
            value: formatNumber(invoiceIds.size),
            icon: "CreditCard",
            description: "The total number of completed purchase transactions.",
            change: "",
        },
        {
            title: "Unique Customers",
            value: formatNumber(uniqueCustomers),
            icon: "Users",
            description:
                customerIdx !== undefined
                    ? "The number of distinct customers who made a purchase."
                    : "Estimated from unique invoice IDs.",
            change: "",
        },
        {
            title: "Avg. Items per Order",
            value: avgItemsPerOrder.toFixed(1),
            icon: "ShoppingBasket",
            description: "The average number of items included in each order.",
            change: "",
        },
    ];
}

function formatCurrency(value: number): string {
    return "$" + Math.round(value).toLocaleString("en-US");
}

function formatNumber(value: number): string {
    return value.toLocaleString("en-US");
}
