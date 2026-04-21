import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import type {
    Upload,
    KpiData,
    CategoryData,
    BundleData,
    ForecastData,
    AiSuggestion,
} from "@/lib/data";

// ─── Palette ───────────────────────────────────────────────────────────────────
const INDIGO = "#6366F1";
const INDIGO_LIGHT = "#EEF2FF";
const INDIGO_DARK = "#4338CA";
const VIOLET = "#8B5CF6";
const GRAY_100 = "#F3F4F6";
const GRAY_200 = "#E5E7EB";
const GRAY_400 = "#9CA3AF";
const GRAY_600 = "#4B5563";
const GRAY_800 = "#1F2937";
const WHITE = "#FFFFFF";
const GREEN = "#16A34A";
const RED = "#DC2626";
const YELLOW = "#D97706";
const BLUE = "#2563EB";
const ORANGE = "#EA580C";
const PURPLE = "#7C3AED";

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    // Page
    page: {
        fontFamily: "Helvetica",
        backgroundColor: WHITE,
        paddingTop: 0,
        paddingBottom: 40,
        paddingHorizontal: 0,
        fontSize: 9,
        color: GRAY_800,
    },
    // Cover header band
    headerBand: {
        backgroundColor: INDIGO,
        paddingTop: 28,
        paddingBottom: 22,
        paddingHorizontal: 36,
        marginBottom: 24,
    },
    headerBadge: {
        backgroundColor: INDIGO_DARK,
        color: WHITE,
        fontSize: 7,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 10,
        alignSelf: "flex-start",
        marginBottom: 8,
        letterSpacing: 0.8,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: "Helvetica-Bold",
        color: WHITE,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 11,
        color: "#C7D2FE",
        marginBottom: 2,
    },
    headerMeta: {
        fontSize: 8,
        color: "#A5B4FC",
        marginTop: 6,
    },
    // Body wrapper
    body: {
        paddingHorizontal: 36,
    },
    // Section
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        borderBottomWidth: 1.5,
        borderBottomColor: INDIGO,
        paddingBottom: 4,
    },
    sectionDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: INDIGO,
        marginRight: 6,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: INDIGO_DARK,
        letterSpacing: 0.3,
    },
    // Metadata row
    metaGrid: {
        flexDirection: "row",
        gap: 10,
    },
    metaCard: {
        flex: 1,
        backgroundColor: INDIGO_LIGHT,
        borderRadius: 6,
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: INDIGO,
    },
    metaLabel: {
        fontSize: 7,
        color: GRAY_400,
        marginBottom: 3,
        letterSpacing: 0.5,
    },
    metaValue: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: GRAY_800,
    },
    // KPI grid
    kpiGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    kpiCard: {
        width: "47.5%",
        backgroundColor: GRAY_100,
        borderRadius: 8,
        padding: 12,
        borderTopWidth: 3,
    },
    kpiTitle: {
        fontSize: 7.5,
        color: GRAY_600,
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    kpiValue: {
        fontSize: 18,
        fontFamily: "Helvetica-Bold",
        color: GRAY_800,
        marginBottom: 4,
    },
    kpiDescription: {
        fontSize: 7,
        color: GRAY_400,
        lineHeight: 1.4,
    },
    // Table
    tableHeader: {
        flexDirection: "row",
        backgroundColor: INDIGO,
        borderRadius: 4,
        paddingVertical: 6,
        paddingHorizontal: 8,
        marginBottom: 2,
    },
    tableHeaderCell: {
        fontSize: 7.5,
        fontFamily: "Helvetica-Bold",
        color: WHITE,
        letterSpacing: 0.3,
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: GRAY_200,
        alignItems: "center",
    },
    tableRowAlt: {
        backgroundColor: GRAY_100,
    },
    tableCell: {
        fontSize: 8,
        color: GRAY_800,
    },
    tableCellMuted: {
        fontSize: 7.5,
        color: GRAY_400,
    },
    // Badge inline
    badge: {
        borderRadius: 3,
        paddingVertical: 1.5,
        paddingHorizontal: 5,
        fontSize: 7,
        fontFamily: "Helvetica-Bold",
        alignSelf: "flex-start",
    },
    // Suggestion card
    suggestionCard: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
    },
    suggestionTop: {
        flexDirection: "row",
        gap: 6,
        marginBottom: 5,
    },
    suggestionTitle: {
        fontSize: 9.5,
        fontFamily: "Helvetica-Bold",
        color: GRAY_800,
        marginBottom: 4,
    },
    suggestionNarrative: {
        fontSize: 8,
        color: GRAY_600,
        lineHeight: 1.5,
    },
    // Empty state
    emptyState: {
        backgroundColor: GRAY_100,
        borderRadius: 6,
        padding: 12,
        alignItems: "center",
    },
    emptyStateText: {
        fontSize: 8,
        color: GRAY_400,
    },
    // Footer
    footer: {
        position: "absolute",
        bottom: 16,
        left: 36,
        right: 36,
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 0.5,
        borderTopColor: GRAY_200,
        paddingTop: 6,
    },
    footerText: {
        fontSize: 7,
        color: GRAY_400,
    },
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
    return (
        "$" +
        value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    );
}

function formatPercent(value: number | null): string {
    if (value === null) return "—";
    return (value >= 0 ? "+" : "") + value.toFixed(2) + "%";
}

function formatDate(dateStr: string): string {
    try {
        return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
        return dateStr;
    }
}

const KPI_ACCENT_COLORS: Record<string, string> = {
    DollarSign: GREEN,
    Users: BLUE,
    CreditCard: PURPLE,
    ShoppingBasket: ORANGE,
};

const AREA_COLORS: Record<string, string> = {
    sales_revenue: GREEN,
    inventory: BLUE,
    marketing: PURPLE,
    customer_retention: ORANGE,
};

const AREA_LABELS: Record<string, string> = {
    sales_revenue: "Sales & Revenue",
    inventory: "Inventory",
    marketing: "Marketing",
    customer_retention: "Customer Retention",
};

const PRIORITY_COLORS: Record<string, string> = {
    high: RED,
    medium: YELLOW,
    low: GRAY_400,
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
    return (
        <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={s.sectionTitle}>{title}</Text>
        </View>
    );
}

function MetadataSection({ dataset }: { dataset: Upload }) {
    const statusColors: Record<string, string> = {
        Completed: GREEN,
        Processing: YELLOW,
        Failed: RED,
        Mapping: BLUE,
    };
    return (
        <View style={s.section}>
            <SectionHeading title="Dataset Information" />
            <View style={s.metaGrid}>
                <View style={s.metaCard}>
                    <Text style={s.metaLabel}>STATUS</Text>
                    <Text
                        style={[
                            s.metaValue,
                            { color: statusColors[dataset.status] ?? GRAY_800 },
                        ]}
                    >
                        {dataset.status}
                    </Text>
                </View>
                <View style={s.metaCard}>
                    <Text style={s.metaLabel}>UPLOAD DATE</Text>
                    <Text style={s.metaValue}>{formatDate(dataset.date)}</Text>
                </View>
                <View style={s.metaCard}>
                    <Text style={s.metaLabel}>RECORD COUNT</Text>
                    <Text style={s.metaValue}>
                        {dataset.recordCount.toLocaleString()} rows
                    </Text>
                </View>
            </View>
        </View>
    );
}

function KpisSection({ kpis }: { kpis: KpiData[] | undefined }) {
    return (
        <View style={s.section}>
            <SectionHeading title="Key Performance Indicators" />
            {!kpis || kpis.length === 0 ? (
                <View style={s.emptyState}>
                    <Text style={s.emptyStateText}>No KPI data available.</Text>
                </View>
            ) : (
                <View style={s.kpiGrid}>
                    {kpis.map((kpi, i) => {
                        const accentColor =
                            KPI_ACCENT_COLORS[kpi.icon] ?? INDIGO;
                        return (
                            <View
                                key={i}
                                style={[
                                    s.kpiCard,
                                    { borderTopColor: accentColor },
                                ]}
                            >
                                <Text style={s.kpiTitle}>
                                    {kpi.title.toUpperCase()}
                                </Text>
                                <Text
                                    style={[s.kpiValue, { color: accentColor }]}
                                >
                                    {kpi.value}
                                </Text>
                                <Text style={s.kpiDescription}>
                                    {kpi.description}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

function CategoriesSection({
    categories,
}: {
    categories: CategoryData[] | undefined;
}) {
    const colWidths = ["28%", "18%", "14%", "25%", "15%"];

    return (
        <View style={s.section}>
            <SectionHeading title="Category Breakdown" />
            {!categories || categories.length === 0 ? (
                <View style={s.emptyState}>
                    <Text style={s.emptyStateText}>
                        No category data available.
                    </Text>
                </View>
            ) : (
                <View>
                    <View style={s.tableHeader}>
                        {[
                            "Category",
                            "Revenue",
                            "Units Sold",
                            "Top Product",
                            "Growth Rate",
                        ].map((h, i) => (
                            <Text
                                key={i}
                                style={[
                                    s.tableHeaderCell,
                                    { width: colWidths[i] },
                                ]}
                            >
                                {h}
                            </Text>
                        ))}
                    </View>
                    {categories.map((cat, i) => {
                        const growth = cat.growthRate;
                        const growthColor =
                            growth === null
                                ? GRAY_400
                                : growth >= 0
                                  ? GREEN
                                  : RED;
                        return (
                            <View
                                key={i}
                                style={[
                                    s.tableRow,
                                    i % 2 === 1 ? s.tableRowAlt : {},
                                ]}
                            >
                                <Text
                                    style={[
                                        s.tableCell,
                                        {
                                            width: colWidths[0],
                                            fontFamily: "Helvetica-Bold",
                                        },
                                    ]}
                                >
                                    {cat.categoryName}
                                </Text>
                                <Text
                                    style={[
                                        s.tableCell,
                                        { width: colWidths[1] },
                                    ]}
                                >
                                    {formatCurrency(cat.totalRevenue)}
                                </Text>
                                <Text
                                    style={[
                                        s.tableCell,
                                        { width: colWidths[2] },
                                    ]}
                                >
                                    {cat.totalUnitsSold.toLocaleString()}
                                </Text>
                                <Text
                                    style={[
                                        s.tableCellMuted,
                                        { width: colWidths[3] },
                                    ]}
                                >
                                    {cat.topProduct.length > 30
                                        ? cat.topProduct.slice(0, 27) + "..."
                                        : cat.topProduct}
                                </Text>
                                <Text
                                    style={[
                                        s.tableCell,
                                        {
                                            width: colWidths[4],
                                            color: growthColor,
                                        },
                                    ]}
                                >
                                    {formatPercent(growth)}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

function BundlesSection({ bundles }: { bundles: BundleData[] | undefined }) {
    const top10 = bundles
        ? [...bundles].sort((a, b) => b.lift - a.lift).slice(0, 10)
        : [];
    const colWidths = ["65%", "18%", "17%"];

    return (
        <View style={s.section}>
            <SectionHeading title="Product Bundles (Top 10 by Lift)" />
            {top10.length === 0 ? (
                <View style={s.emptyState}>
                    <Text style={s.emptyStateText}>
                        No bundle data available.
                    </Text>
                </View>
            ) : (
                <View>
                    <View style={s.tableHeader}>
                        {[
                            "Products (Bought Together → Also Bought)",
                            "Confidence",
                            "Lift",
                        ].map((h, i) => (
                            <Text
                                key={i}
                                style={[
                                    s.tableHeaderCell,
                                    { width: colWidths[i] },
                                ]}
                            >
                                {h}
                            </Text>
                        ))}
                    </View>
                    {top10.map((bundle, i) => {
                        const products =
                            bundle.antecedents.join(", ") +
                            " → " +
                            bundle.consequents.join(", ");
                        return (
                            <View
                                key={i}
                                style={[
                                    s.tableRow,
                                    i % 2 === 1 ? s.tableRowAlt : {},
                                ]}
                            >
                                <Text
                                    style={[
                                        s.tableCellMuted,
                                        { width: colWidths[0] },
                                    ]}
                                >
                                    {products.length > 80
                                        ? products.slice(0, 77) + "..."
                                        : products}
                                </Text>
                                <Text
                                    style={[
                                        s.tableCell,
                                        { width: colWidths[1] },
                                    ]}
                                >
                                    {(bundle.confidence * 100).toFixed(1)}%
                                </Text>
                                <Text
                                    style={[
                                        s.tableCell,
                                        {
                                            width: colWidths[2],
                                            fontFamily: "Helvetica-Bold",
                                            color: INDIGO,
                                        },
                                    ]}
                                >
                                    {bundle.lift.toFixed(2)}x
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

function ForecastSection({
    forecasts,
    legacyForecast,
}: {
    forecasts: Record<number, ForecastData[]> | undefined;
    legacyForecast: ForecastData[] | undefined;
}) {
    const forecastData: ForecastData[] | undefined =
        forecasts?.[7] ?? legacyForecast;
    const colWidths = ["28%", "24%", "24%", "24%"];

    return (
        <View style={s.section}>
            <SectionHeading title="Sales Forecast (7-Day)" />
            {!forecastData || forecastData.length === 0 ? (
                <View style={s.emptyState}>
                    <Text style={s.emptyStateText}>
                        No forecast data available.
                    </Text>
                </View>
            ) : (
                <View>
                    <View style={s.tableHeader}>
                        {[
                            "Date",
                            "Predicted Sales",
                            "Lower Bound",
                            "Upper Bound",
                        ].map((h, i) => (
                            <Text
                                key={i}
                                style={[
                                    s.tableHeaderCell,
                                    { width: colWidths[i] },
                                ]}
                            >
                                {h}
                            </Text>
                        ))}
                    </View>
                    {forecastData.slice(0, 14).map((row, i) => (
                        <View
                            key={i}
                            style={[
                                s.tableRow,
                                i % 2 === 1 ? s.tableRowAlt : {},
                            ]}
                        >
                            <Text
                                style={[s.tableCell, { width: colWidths[0] }]}
                            >
                                {formatDate(row.date)}
                            </Text>
                            <Text
                                style={[s.tableCell, { width: colWidths[1] }]}
                            >
                                {row.predicted !== null
                                    ? formatCurrency(row.predicted)
                                    : "—"}
                            </Text>
                            <Text
                                style={[
                                    s.tableCellMuted,
                                    { width: colWidths[2] },
                                ]}
                            >
                                {row.lower !== null
                                    ? formatCurrency(row.lower)
                                    : "—"}
                            </Text>
                            <Text
                                style={[
                                    s.tableCellMuted,
                                    { width: colWidths[3] },
                                ]}
                            >
                                {row.upper !== null
                                    ? formatCurrency(row.upper)
                                    : "—"}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

function SuggestionsSection({
    suggestions,
}: {
    suggestions: AiSuggestion[] | undefined;
}) {
    return (
        <View style={s.section}>
            <SectionHeading title="AI-Powered Recommendations" />
            {!suggestions || suggestions.length === 0 ? (
                <View style={s.emptyState}>
                    <Text style={s.emptyStateText}>
                        No AI suggestions available.
                    </Text>
                </View>
            ) : (
                suggestions.map((sug, i) => {
                    const areaColor = AREA_COLORS[sug.area] ?? INDIGO;
                    return (
                        <View
                            key={i}
                            style={[
                                s.suggestionCard,
                                {
                                    borderLeftColor: areaColor,
                                    backgroundColor: GRAY_100,
                                },
                            ]}
                        >
                            <View style={s.suggestionTop}>
                                <Text
                                    style={[
                                        s.badge,
                                        {
                                            backgroundColor: areaColor + "22",
                                            color: areaColor,
                                        },
                                    ]}
                                >
                                    {AREA_LABELS[sug.area] ?? sug.area}
                                </Text>
                                <Text
                                    style={[
                                        s.badge,
                                        {
                                            backgroundColor:
                                                PRIORITY_COLORS[sug.priority] +
                                                "22",
                                            color: PRIORITY_COLORS[
                                                sug.priority
                                            ],
                                        },
                                    ]}
                                >
                                    {sug.priority.toUpperCase()} PRIORITY
                                </Text>
                            </View>
                            <Text style={s.suggestionTitle}>{sug.title}</Text>
                            <Text style={s.suggestionNarrative}>
                                {sug.narrative}
                            </Text>
                        </View>
                    );
                })
            )}
        </View>
    );
}

// ─── Main Document Export ──────────────────────────────────────────────────────

interface ReportDocumentProps {
    dataset: Upload;
}

export default function ReportDocument({ dataset }: ReportDocumentProps) {
    const generatedAt = format(new Date(), "MMMM d, yyyy 'at' h:mm a");
    const baseName = dataset.filename.replace(/\.csv$/i, "");

    return (
        <Document
            title={`NuvIQ Report — ${baseName}`}
            author="NuvIQ"
            subject="Sales Analytics Report"
        >
            <Page size="A4" style={s.page}>
                {/* ── Cover Band ─────────────────────────────────────── */}
                <View style={s.headerBand} fixed>
                    <Text style={s.headerBadge}>NUVIQ ANALYTICS</Text>
                    <Text style={s.headerTitle}>Analytics Report</Text>
                    <Text style={s.headerSubtitle}>{baseName}</Text>
                    <Text style={s.headerMeta}>Generated on {generatedAt}</Text>
                </View>

                {/* ── Body ───────────────────────────────────────────── */}
                <View style={s.body}>
                    <MetadataSection dataset={dataset} />
                    <KpisSection kpis={dataset.kpis} />
                    <CategoriesSection categories={dataset.categories} />
                    <BundlesSection bundles={dataset.bundles} />
                    <ForecastSection
                        forecasts={dataset.forecasts}
                        legacyForecast={dataset.forecast}
                    />
                    <SuggestionsSection
                        suggestions={dataset.suggestions?.suggestions}
                    />
                </View>

                {/* ── Footer ─────────────────────────────────────────── */}
                <View style={s.footer} fixed>
                    <Text style={s.footerText}>
                        NuvIQ — Confidential Analytics Report
                    </Text>
                    <Text
                        style={s.footerText}
                        render={({ pageNumber, totalPages }) =>
                            `Page ${pageNumber} of ${totalPages}`
                        }
                    />
                </View>
            </Page>
        </Document>
    );
}
