"use client";
import { useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Download,
    TrendingUp,
    TrendingDown,
    Tags,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { useDataset } from "@/contexts/dataset-context";
import { useToast } from "@/hooks/use-toast";
import { updateDataset } from "@/lib/firestore";
import { computeCategories } from "@/lib/compute-categories";

export default function CategoriesTable() {
    const { selectedDataset } = useDataset();
    const { toast } = useToast();
    const [retrying, setRetrying] = useState(false);
    const categoriesData = selectedDataset?.categories;

    const handleDownload = () => {
        if (!categoriesData) return;
        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(categoriesData, null, 2));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute(
            "download",
            `${selectedDataset?.filename}_categories.json`,
        );
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleRetryCategories = async () => {
        if (!selectedDataset || !selectedDataset.headerMap) return;
        setRetrying(true);
        try {
            const categories = computeCategories(
                selectedDataset.content,
                selectedDataset.headerMap,
            );
            await updateDataset(selectedDataset.id, { categories });
            if (categories.length === 0) {
                toast({
                    title: "No Categories Found",
                    description:
                        "The dataset doesn't have enough category data to analyze.",
                });
            } else {
                toast({
                    title: "Categories Generated",
                    description: "Category performance data is now available.",
                });
            }
        } catch (error: any) {
            console.error("Retry categories failed:", error);
            toast({
                title: "Category Retry Failed",
                description:
                    error.message ||
                    "Could not generate categories. Try again later.",
                variant: "destructive",
            });
        } finally {
            setRetrying(false);
        }
    };

    return (
        <Card className="relative overflow-hidden shadow-sm">
            {/* Card background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-chart-3/[0.04] via-transparent to-primary/[0.02] pointer-events-none" />
            <div className="absolute inset-0 bg-grid-pattern-subtle opacity-20 pointer-events-none" />
            <div
                className="geo-shape geo-ring w-[85px] h-[85px] -top-6 -right-6 opacity-25"
                style={{ borderColor: "hsl(var(--chart-3) / 0.15)" }}
            />
            <div className="geo-shape geo-hexagon w-[22px] h-[22px] bottom-4 left-6 opacity-40" />
            <CardHeader className="relative flex flex-row items-start justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-chart-3/10 text-chart-3">
                            <Tags className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg">
                            Category Performance
                        </CardTitle>
                    </div>
                    <CardDescription>
                        {selectedDataset
                            ? `Revenue and growth breakdown by product category for ${selectedDataset.filename}`
                            : "Select a dataset to view category performance."}
                    </CardDescription>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!categoriesData || categoriesData.length === 0}
                    className="rounded-lg"
                >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Export
                </Button>
            </CardHeader>
            <CardContent>
                {categoriesData && categoriesData.length > 0 ? (
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">
                                        Category
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                        Total Revenue
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                        Units Sold
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Top Product
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                        Growth Rate
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categoriesData.map((category, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">
                                            {category.categoryName}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            $
                                            {category.totalRevenue.toLocaleString(
                                                undefined,
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                },
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {category.totalUnitsSold.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {category.topProduct}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    category.growthRate > 0
                                                        ? "bg-green-500/10 text-green-600"
                                                        : category.growthRate <
                                                            0
                                                          ? "bg-red-500/10 text-red-600"
                                                          : "bg-muted text-muted-foreground"
                                                }`}
                                            >
                                                {category.growthRate > 0 ? (
                                                    <TrendingUp className="h-3 w-3" />
                                                ) : category.growthRate < 0 ? (
                                                    <TrendingDown className="h-3 w-3" />
                                                ) : null}
                                                {category.growthRate > 0
                                                    ? "+"
                                                    : ""}
                                                {category.growthRate.toFixed(1)}
                                                %
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="h-60 flex flex-col items-center justify-center text-center relative overflow-hidden rounded-xl">
                        {/* Background decoration */}
                        <div className="absolute inset-0 bg-grid-pattern-subtle opacity-60" />
                        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-chart-3/[0.06] to-transparent rounded-full -translate-y-1/3 translate-x-1/4" />
                        <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-purple-500/[0.04] to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />

                        {selectedDataset ? (
                            selectedDataset.headerMap?.category ===
                            undefined ? (
                                <div className="relative z-10">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/80 mb-4 mx-auto border border-border/50">
                                        <Tags className="h-7 w-7 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium text-sm">
                                        Category mapping skipped
                                    </p>
                                    <p className="text-muted-foreground/60 text-xs mt-1 max-w-xs">
                                        Category data was not mapped during
                                        upload for this dataset.
                                    </p>
                                </div>
                            ) : selectedDataset.status !== "Completed" ? (
                                <div className="relative z-10">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-500/10 mb-4 mx-auto">
                                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">
                                        Analyzing category performance...
                                    </p>
                                    <p className="text-muted-foreground/60 text-xs mt-1">
                                        Crunching the numbers
                                    </p>
                                </div>
                            ) : (
                                <div className="relative z-10">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/80 mb-4 mx-auto border border-border/50">
                                        <Tags className="h-7 w-7 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium text-sm">
                                        Category analysis failed
                                    </p>
                                    <p className="text-muted-foreground/60 text-xs mt-1 max-w-xs">
                                        Could not generate category performance.
                                        Click retry to try again.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={handleRetryCategories}
                                        disabled={retrying}
                                    >
                                        {retrying ? (
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                        )}
                                        {retrying
                                            ? "Analyzing..."
                                            : "Retry Categories"}
                                    </Button>
                                </div>
                            )
                        ) : (
                            <div className="relative z-10">
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/80 mb-4 mx-auto border border-border/50">
                                    <Tags className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium text-sm">
                                    No category data yet
                                </p>
                                <p className="text-muted-foreground/60 text-xs mt-1 max-w-xs">
                                    Select a processed dataset to see revenue
                                    breakdowns and growth rates by category.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
