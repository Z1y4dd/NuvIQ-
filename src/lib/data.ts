export interface Upload {
    id: string;
    filename: string;
    date: string;
    status: "Completed" | "Processing" | "Failed" | "Mapping";
    recordCount: number;
    content: string[][]; // Store parsed CSV content
    kpis?: KpiData[];
    forecast?: ForecastData[];
    bundles?: BundleData[];
    categories?: CategoryData[];
    headerMap?: Record<string, number>;
}

export interface CategoryData {
    categoryName: string;
    totalRevenue: number;
    totalUnitsSold: number;
    topProduct: string;
    growthRate: number;
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
