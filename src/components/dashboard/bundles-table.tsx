"use client";
import { useState, useMemo } from "react";
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
import { Download, Loader2, RefreshCw, ShoppingBasket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useDataset } from "@/contexts/dataset-context";
import { useToast } from "@/hooks/use-toast";
import { updateDataset } from "@/lib/firestore";
import { computeBundles } from "@/lib/compute-bundles";
import { BundleData } from "@/lib/data";

export default function BundlesTable() {
    const { selectedDataset } = useDataset();
    const { toast } = useToast();
    const [retrying, setRetrying] = useState(false);
    const [minConfidence, setMinConfidence] = useState(0);
    const [minLift, setMinLift] = useState(0);
    const bundlesData = selectedDataset?.bundles;

    const filteredBundles = useMemo(() => {
        if (!bundlesData) return [];
        return bundlesData.filter(
            (rule) => rule.confidence >= minConfidence && rule.lift >= minLift,
        );
    }, [bundlesData, minConfidence, minLift]);

    const maxLift = useMemo(() => {
        if (!bundlesData || bundlesData.length === 0) return 5;
        return Math.ceil(Math.max(...bundlesData.map((r) => r.lift)));
    }, [bundlesData]);

    const handleDownload = () => {
        if (!bundlesData) return;
        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(bundlesData, null, 2));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute(
            "download",
            `${selectedDataset?.filename}_bundles.json`,
        );
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleRetryBundles = async () => {
        if (!selectedDataset || !selectedDataset.headerMap) return;
        setRetrying(true);
        try {
            const bundles = computeBundles(
                selectedDataset.content,
                selectedDataset.headerMap,
            );
            await updateDataset(selectedDataset.id, { bundles });
            if (bundles.length === 0) {
                toast({
                    title: "No Bundles Found",
                    description:
                        "The dataset doesn't have enough multi-product transactions to find product associations.",
                });
            } else {
                toast({
                    title: "Bundles Generated",
                    description:
                        "Product bundle recommendations are now available.",
                });
            }
        } catch (error: any) {
            console.error("Retry bundles failed:", error);
            toast({
                title: "Bundle Retry Failed",
                description:
                    error.message ||
                    "Could not generate bundles. Try again later.",
                variant: "destructive",
            });
        } finally {
            setRetrying(false);
        }
    };

    return (
        <Card className="relative overflow-hidden shadow-sm">
            {/* Card background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-primary/[0.02] pointer-events-none" />
            <div className="absolute inset-0 bg-grid-pattern-subtle opacity-20 pointer-events-none" />
            <div className="geo-shape geo-ring-accent w-[90px] h-[90px] -top-6 -right-6 opacity-30" />
            <div className="geo-shape geo-diamond w-[18px] h-[18px] bottom-4 left-6 opacity-40" />
            <CardHeader className="relative flex flex-row items-start justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-accent/10 text-accent">
                            <ShoppingBasket className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg">
                            Product Bundle Recommendations
                        </CardTitle>
                    </div>
                    <CardDescription>
                        {selectedDataset
                            ? `Top product associations from market basket analysis on ${selectedDataset.filename}`
                            : "Select a dataset to view bundle recommendations."}
                    </CardDescription>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!bundlesData || bundlesData.length === 0}
                    className="rounded-lg"
                >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Export
                </Button>
            </CardHeader>
            <CardContent>
                {bundlesData && bundlesData.length > 0 ? (
                    <>
                        <div className="flex flex-wrap items-end gap-6 mb-4">
                            <div className="flex-1 min-w-[180px] space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Min Confidence
                                    </span>
                                    <span className="text-xs font-mono tabular-nums text-foreground">
                                        {(minConfidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <Slider
                                    value={[minConfidence]}
                                    onValueChange={([v]) => setMinConfidence(v)}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex-1 min-w-[180px] space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Min Lift
                                    </span>
                                    <span className="text-xs font-mono tabular-nums text-foreground">
                                        {minLift.toFixed(1)}
                                    </span>
                                </div>
                                <Slider
                                    value={[minLift]}
                                    onValueChange={([v]) => setMinLift(v)}
                                    min={0}
                                    max={maxLift}
                                    step={0.1}
                                    className="w-full"
                                />
                            </div>
                            <span className="text-xs text-muted-foreground/70 pb-0.5">
                                {filteredBundles.length} of {bundlesData.length}{" "}
                                rules
                            </span>
                        </div>
                        {filteredBundles.length > 0 ? (
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="font-semibold">
                                                Bought Together
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Also Bought
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Confidence
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Lift
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBundles.map((rule, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {rule.antecedents.map(
                                                            (item) => (
                                                                <Badge
                                                                    key={item}
                                                                    variant="secondary"
                                                                    className="rounded-md font-normal"
                                                                >
                                                                    {item}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {rule.consequents.map(
                                                            (item) => (
                                                                <Badge
                                                                    key={item}
                                                                    variant="outline"
                                                                    className="rounded-md font-normal"
                                                                >
                                                                    {item}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm">
                                                    {rule.confidence.toFixed(4)}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm">
                                                    {rule.lift.toFixed(4)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="h-32 flex items-center justify-center text-center rounded-xl border border-dashed">
                                <p className="text-muted-foreground text-sm">
                                    No rules match the current filters. Lower
                                    the thresholds to see results.
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="h-60 flex flex-col items-center justify-center text-center relative overflow-hidden rounded-xl">
                        {/* Background decoration */}
                        <div className="absolute inset-0 bg-grid-pattern-subtle opacity-60" />
                        <div className="absolute top-0 left-0 w-36 h-36 bg-gradient-to-br from-accent/[0.06] to-transparent rounded-full -translate-y-1/3 -translate-x-1/4" />
                        <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-primary/[0.05] to-transparent rounded-full translate-y-1/3 translate-x-1/4" />

                        {selectedDataset &&
                        selectedDataset.status !== "Completed" ? (
                            <div className="relative z-10">
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-accent/10 mb-4 mx-auto">
                                    <Loader2 className="h-8 w-8 text-accent animate-spin" />
                                </div>
                                <p className="text-muted-foreground text-sm font-medium">
                                    Analyzing product bundles...
                                </p>
                                <p className="text-muted-foreground/60 text-xs mt-1">
                                    Running market basket analysis
                                </p>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/80 mb-4 mx-auto border border-border/50">
                                    <ShoppingBasket className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium text-sm">
                                    {selectedDataset?.status === "Completed" &&
                                    selectedDataset?.bundles !== undefined
                                        ? "No product associations found"
                                        : selectedDataset?.status ===
                                            "Completed"
                                          ? "Bundle analysis failed"
                                          : "No bundle data yet"}
                                </p>
                                <p className="text-muted-foreground/60 text-xs mt-1 max-w-xs">
                                    {selectedDataset?.status === "Completed" &&
                                    selectedDataset?.bundles !== undefined
                                        ? "This dataset doesn't have enough multi-product transactions to identify product associations."
                                        : selectedDataset?.status ===
                                            "Completed"
                                          ? "The market basket analysis could not be completed. Click retry to try again."
                                          : "Select a processed dataset to discover which products are frequently bought together."}
                                </p>
                                {selectedDataset?.status === "Completed" &&
                                    selectedDataset?.headerMap && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-4"
                                            onClick={handleRetryBundles}
                                            disabled={retrying}
                                        >
                                            {retrying ? (
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                            )}
                                            {retrying
                                                ? "Analyzing..."
                                                : "Retry Bundles"}
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
