"use client";
import { useState, useMemo } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Area,
    Tooltip,
} from "recharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { useDataset } from "@/contexts/dataset-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { extractCsvSample } from "@/lib/dataset-utils";
import { updateDataset } from "@/lib/firestore";
import { ForecastData } from "@/lib/data";

export default function ForecastChart() {
    const { selectedDataset } = useDataset();
    const { user } = useAuth();
    const { toast } = useToast();
    const [retrying, setRetrying] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<string>("7");

    const PERIODS = [
        { value: "7", label: "7 days" },
        { value: "30", label: "30 days" },
        { value: "90", label: "90 days" },
    ];

    // Resolve available periods from new `forecasts` record or legacy `forecast` field
    const availablePeriods = useMemo(() => {
        if (selectedDataset?.forecasts) {
            return Object.keys(selectedDataset.forecasts).map(Number);
        }
        if (selectedDataset?.forecast?.length) {
            return [7]; // legacy data only has 7-day
        }
        return [];
    }, [selectedDataset?.forecasts, selectedDataset?.forecast]);

    // Get forecast data for the currently selected period
    const forecastData = useMemo<ForecastData[] | undefined>(() => {
        const period = Number(selectedPeriod);
        if (selectedDataset?.forecasts?.[period]) {
            return selectedDataset.forecasts[period];
        }
        // Fallback to legacy flat forecast field (treated as 7-day)
        if (period === 7 && selectedDataset?.forecast?.length) {
            return selectedDataset.forecast;
        }
        return undefined;
    }, [selectedDataset?.forecasts, selectedDataset?.forecast, selectedPeriod]);

    // Transform data for proper confidence band rendering:
    // Recharts needs a [lower, upper] range for the band area.
    const chartData = (forecastData ?? []).map((d) => ({
        ...d,
        confidenceBand:
            d.lower != null && d.upper != null ? [d.lower, d.upper] : null,
    }));

    const chartConfig = {
        predicted: {
            label: "Predicted Sales",
            color: "hsl(var(--chart-1))",
        },
        confidenceBand: {
            label: "Confidence Interval",
            color: "hsl(var(--chart-1))",
        },
    };

    const handleDownload = () => {
        if (!forecastData) return;
        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(forecastData, null, 2));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute(
            "download",
            `${selectedDataset?.filename}_forecast.json`,
        );
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleRetryForecast = async () => {
        if (!selectedDataset || !user || !selectedDataset.headerMap) return;
        setRetrying(true);
        try {
            const idToken = await user.getIdToken();
            const csvData = extractCsvSample(
                selectedDataset.content,
                selectedDataset.headerMap,
            );
            const response = await fetch("/api/ai/generate-forecast", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    datasetId: selectedDataset.id,
                    forecastDays: [7, 30, 90],
                    csvData,
                }),
            });
            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                throw new Error(errBody?.error || response.statusText);
            }
            const forecastResult = await response.json();
            const forecastsByPeriod: Record<number, ForecastData[]> = {};
            for (const f of forecastResult.forecasts ?? []) {
                const days = Number(f.forecastDays);
                if (f.results?.length) {
                    forecastsByPeriod[days] = f.results.map((r: any) => ({
                        date: r.date,
                        sales: null,
                        predicted: r.predictedSales,
                        lower: r.confidenceIntervalLower,
                        upper: r.confidenceIntervalUpper,
                    }));
                }
            }
            if (Object.keys(forecastsByPeriod).length > 0) {
                await updateDataset(selectedDataset.id, {
                    forecasts: forecastsByPeriod,
                    forecast:
                        forecastsByPeriod[7] ??
                        Object.values(forecastsByPeriod)[0],
                });
                toast({
                    title: "Forecast Generated",
                    description:
                        "Sales forecasts are now available for all periods.",
                });
            } else {
                throw new Error("No forecast data in AI response.");
            }
        } catch (error: any) {
            console.error("Retry forecast failed:", error);
            toast({
                title: "Forecast Retry Failed",
                description:
                    error.message ||
                    "Could not generate forecast. Try again later.",
                variant: "destructive",
            });
        } finally {
            setRetrying(false);
        }
    };

    return (
        <Card className="relative overflow-hidden shadow-sm">
            {/* Card background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.02] pointer-events-none" />
            <div className="absolute inset-0 bg-grid-pattern-subtle opacity-20 pointer-events-none" />
            <div className="geo-shape geo-ring w-[100px] h-[100px] -top-8 -right-8 opacity-30" />
            <div className="geo-shape geo-circle-filled w-[14px] h-[14px] bottom-4 left-6 opacity-50" />
            <CardHeader className="relative flex flex-row items-start justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg">
                            Sales Forecast
                        </CardTitle>
                    </div>
                    <CardDescription>
                        {selectedDataset
                            ? `${selectedPeriod}-day sales forecast for ${selectedDataset.filename}`
                            : "Select a dataset to view its forecast."}
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {selectedDataset && availablePeriods.length > 0 && (
                        <Select
                            value={selectedPeriod}
                            onValueChange={setSelectedPeriod}
                        >
                            <SelectTrigger className="w-[120px] h-9 rounded-lg">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent>
                                {PERIODS.map((p) => (
                                    <SelectItem
                                        key={p.value}
                                        value={p.value}
                                        disabled={
                                            !availablePeriods.includes(
                                                Number(p.value),
                                            )
                                        }
                                    >
                                        {p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        disabled={!forecastData || forecastData.length === 0}
                        className="rounded-lg"
                    >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Export
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {forecastData && forecastData.length > 0 ? (
                    <ChartContainer
                        config={chartConfig}
                        className="h-[350px] w-full"
                    >
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient
                                    id="colorPredicted"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-predicted)"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-predicted)"
                                        stopOpacity={0.02}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="3 3"
                                className="stroke-muted"
                            />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) =>
                                    new Date(value).toLocaleDateString(
                                        "en-US",
                                        { month: "short", day: "numeric" },
                                    )
                                }
                                className="text-xs"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={4}
                                className="text-xs"
                                domain={["auto", "auto"]}
                            />
                            <Tooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent indicator="dot" />
                                }
                            />
                            {/* Confidence band as a range area [lower, upper] */}
                            <Area
                                dataKey="confidenceBand"
                                type="monotone"
                                stroke="none"
                                fill="hsl(var(--chart-1))"
                                fillOpacity={0.1}
                                name="Confidence Interval"
                                isAnimationActive={false}
                            />
                            {/* Predicted line on top */}
                            <Area
                                dataKey="predicted"
                                type="monotone"
                                fill="url(#colorPredicted)"
                                stroke="var(--color-predicted)"
                                strokeWidth={2}
                                name="Predicted Sales"
                            />
                        </AreaChart>
                    </ChartContainer>
                ) : (
                    <div className="h-[350px] flex flex-col items-center justify-center text-center relative overflow-hidden rounded-xl">
                        {/* Background decoration */}
                        <div className="absolute inset-0 bg-grid-pattern-subtle opacity-60" />
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/[0.06] to-transparent rounded-full -translate-y-1/3 translate-x-1/4" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/[0.05] to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />

                        {selectedDataset &&
                        selectedDataset.status !== "Completed" ? (
                            <div className="relative z-10">
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4 mx-auto">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                </div>
                                <p className="text-muted-foreground text-sm font-medium">
                                    Generating forecast data...
                                </p>
                                <p className="text-muted-foreground/60 text-xs mt-1">
                                    This may take a moment
                                </p>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/80 mb-4 mx-auto border border-border/50">
                                    <TrendingUp className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium text-sm">
                                    {selectedDataset?.status === "Completed"
                                        ? "Forecast analysis failed"
                                        : "No forecast data yet"}
                                </p>
                                <p className="text-muted-foreground/60 text-xs mt-1 max-w-xs">
                                    {selectedDataset?.status === "Completed"
                                        ? "The forecast could not be generated. Click retry to try again."
                                        : "Select a processed dataset from the Uploads tab to view AI-powered sales predictions."}
                                </p>
                                {selectedDataset?.status === "Completed" &&
                                    selectedDataset?.headerMap && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-4"
                                            onClick={handleRetryForecast}
                                            disabled={retrying}
                                        >
                                            {retrying ? (
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                            )}
                                            {retrying
                                                ? "Generating..."
                                                : "Retry Forecast"}
                                        </Button>
                                    )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
