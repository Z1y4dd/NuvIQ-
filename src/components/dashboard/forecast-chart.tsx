'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, CartesianGrid, XAxis, Area, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Download, Loader2, TrendingUp } from "lucide-react";
import { useDataset } from "@/contexts/dataset-context";
import { ForecastData } from "@/lib/data";

export default function ForecastChart() {
    const { selectedDataset } = useDataset();
    const forecastData = selectedDataset?.forecast;

    const chartConfig = {
        predicted: {
            label: "Predicted",
            color: "hsl(var(--chart-1))",
        },
    };

    const handleDownload = () => {
        if (!forecastData) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(forecastData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${selectedDataset?.filename}_forecast.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

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
                        <CardTitle className="text-lg">Sales Forecast</CardTitle>
                    </div>
                    <CardDescription>
                       {selectedDataset ? `7-day sales forecast for ${selectedDataset.filename}` : 'Select a dataset to view its forecast.'}
                    </CardDescription>
                </div>
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
            </CardHeader>
            <CardContent>
                {forecastData && forecastData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                        <AreaChart data={forecastData}>
                            <defs>
                                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-predicted)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-predicted)" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                className="text-xs"
                            />
                            <Tooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                                dataKey="upper"
                                type="monotone"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={0}
                                fill="hsl(var(--chart-1))"
                                fillOpacity={0.1}
                                stackId="confidence"
                                name="Confidence Upper"
                            />
                             <Area
                                dataKey="lower"
                                type="monotone"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={0}
                                fill="hsl(var(--background))"
                                fillOpacity={1}
                                stackId="confidence"
                                name="Confidence Lower"
                            />
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

                        {selectedDataset ? (
                            <div className="relative z-10">
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4 mx-auto">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                </div>
                                <p className="text-muted-foreground text-sm font-medium">Generating forecast data...</p>
                                <p className="text-muted-foreground/60 text-xs mt-1">This may take a moment</p>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/80 mb-4 mx-auto border border-border/50">
                                    <TrendingUp className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium text-sm">No forecast data yet</p>
                                <p className="text-muted-foreground/60 text-xs mt-1 max-w-xs">
                                    Select a processed dataset from the Uploads tab to view AI-powered sales predictions.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
