export interface AiSuggestion {
    area: "sales_revenue" | "inventory" | "marketing" | "customer_retention";
    title: string;
    narrative: string;
    priority: "high" | "medium" | "low";
}

export interface SuggestionsData {
    suggestions: AiSuggestion[];
    generatedAt: string;
}

export interface Upload {
    id: string;
    filename: string;
    date: string;
    status: "Completed" | "Processing" | "Failed" | "Mapping";
    recordCount: number;
    content: string[][]; // Store parsed CSV content
    kpis?: KpiData[];
    forecast?: ForecastData[];
    forecasts?: Record<number, ForecastData[]>;
    bundles?: BundleData[];
    categories?: CategoryData[];
    suggestions?: SuggestionsData;
    headerMap?: Record<string, number>;
}

export interface CategoryData {
    categoryName: string;
    totalRevenue: number;
    totalUnitsSold: number;
    topProduct: string;
    growthRate: number | null;
}

export interface KpiData {
    title: string;
    value: string;
    change: string;
    icon: string;
    description: string;
}

export interface ForecastData {
    date: string;
    sales: number | null;
    predicted: number | null;
    lower: number | null;
    upper: number | null;
}

export interface BundleData {
    antecedents: string[];
    consequents: string[];
    support: number;
    confidence: number;
    lift: number;
}
