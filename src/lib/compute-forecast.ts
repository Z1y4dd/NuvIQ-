import type { ForecastData } from "./data";

/**
 * Generates a deterministic sales forecast using linear regression with
 * seasonal adjustments. No AI — runs purely over the dataset.
 *
 * @param content   Full parsed CSV (string[][]) with headers at index 0.
 * @param headerMap Map of column-name → column-index.
 * @param periods   Array of forecast horizons in days (e.g. [7, 30, 90]).
 * @returns Record keyed by period (days) → ForecastData[].
 */
export function computeForecast(
    content: string[][],
    headerMap: Record<string, number>,
    periods: number[] = [7, 30, 90],
): Record<number, ForecastData[]> {
    const dateIdx = headerMap["date"];
    const revenueIdx = headerMap["total revenue"];

    if (dateIdx === undefined || revenueIdx === undefined) {
        return {};
    }

    // Step 1: Aggregate daily revenue
    const dailyRevenue = new Map<string, number>();
    const dataRows = content.slice(1);

    for (const row of dataRows) {
        const rawDate = row[dateIdx]?.trim();
        const rawRevenue = row[revenueIdx]?.trim();
        if (!rawDate || !rawRevenue) continue;

        const dateKey = normalizeDate(rawDate);
        if (!dateKey) continue;

        const revenue = parseFloat(rawRevenue.replace(/[^0-9.\-]/g, ""));
        if (isNaN(revenue)) continue;

        dailyRevenue.set(dateKey, (dailyRevenue.get(dateKey) || 0) + revenue);
    }

    if (dailyRevenue.size < 2) return {};

    // Step 2: Sort by date and build numeric series
    const sorted = [...dailyRevenue.entries()]
        .map(([dateStr, rev]) => ({ date: new Date(dateStr), revenue: rev }))
        .filter((d) => !isNaN(d.date.getTime()))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (sorted.length < 2) return {};

    const startTime = sorted[0].date.getTime();
    const msPerDay = 86400000;

    // x = day index from start, y = revenue
    const xs = sorted.map((d) =>
        Math.round((d.date.getTime() - startTime) / msPerDay),
    );
    const ys = sorted.map((d) => d.revenue);

    // Step 3: Linear regression  y = slope * x + intercept
    const n = xs.length;
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
    const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);

    const denom = n * sumX2 - sumX * sumX;
    const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
    const intercept = (sumY - slope * sumX) / n;

    // Step 4: Weekly seasonality — average residual by day-of-week
    const dayOfWeekResiduals: number[][] = [[], [], [], [], [], [], []];
    for (let i = 0; i < n; i++) {
        const predicted = slope * xs[i] + intercept;
        const residual = ys[i] - predicted;
        const dow = sorted[i].date.getDay();
        dayOfWeekResiduals[dow].push(residual);
    }

    const seasonalAdj: number[] = dayOfWeekResiduals.map((residuals) => {
        if (residuals.length === 0) return 0;
        return residuals.reduce((a, b) => a + b, 0) / residuals.length;
    });

    // Step 5: Calculate residual standard deviation for confidence intervals
    let sumSqResidual = 0;
    for (let i = 0; i < n; i++) {
        const dow = sorted[i].date.getDay();
        const predicted = slope * xs[i] + intercept + seasonalAdj[dow];
        const residual = ys[i] - predicted;
        sumSqResidual += residual * residual;
    }
    const residualStd = Math.sqrt(sumSqResidual / Math.max(n - 2, 1));

    // Step 6: Generate forecasts for each period
    const lastDate = sorted[sorted.length - 1].date;
    const lastX = xs[xs.length - 1];
    const result: Record<number, ForecastData[]> = {};

    for (const days of periods) {
        const forecasts: ForecastData[] = [];

        for (let d = 1; d <= days; d++) {
            const futureDate = new Date(lastDate.getTime() + d * msPerDay);
            const futureX = lastX + d;
            const dow = futureDate.getDay();

            let predicted = slope * futureX + intercept + seasonalAdj[dow];

            // Don't allow negative predictions
            predicted = Math.max(0, predicted);

            // Confidence interval widens with distance
            const ciWidth = 1.96 * residualStd * Math.sqrt(1 + d / n);
            const lower = Math.max(0, predicted - ciWidth);
            const upper = predicted + ciWidth;

            forecasts.push({
                date: formatDate(futureDate),
                sales: null,
                predicted: round2(predicted),
                lower: round2(lower),
                upper: round2(upper),
            });
        }

        result[days] = forecasts;
    }

    return result;
}

/** Try to normalise various date formats to YYYY-MM-DD */
function normalizeDate(raw: string): string | null {
    // Already ISO-ish: 2024-01-15 or 2024/01/15
    const isoMatch = raw.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
    }

    // US format: MM/DD/YYYY or MM-DD-YYYY
    const usMatch = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (usMatch) {
        return `${usMatch[3]}-${usMatch[1].padStart(2, "0")}-${usMatch[2].padStart(2, "0")}`;
    }

    // DD/MM/YYYY where day > 12
    const euMatch = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (euMatch) {
        const first = parseInt(euMatch[1]);
        const second = parseInt(euMatch[2]);
        if (first > 12) {
            return `${euMatch[3]}-${euMatch[2].padStart(2, "0")}-${euMatch[1].padStart(2, "0")}`;
        }
    }

    // Fallback to Date.parse
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
    }

    return null;
}

function formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
