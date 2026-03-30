"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiData } from "@/lib/data";
import {
    DollarSign,
    Users,
    CreditCard,
    ShoppingBasket,
    Inbox,
    Loader2,
    ArrowUpRight,
    XCircle,
    RefreshCw,
} from "lucide-react";
import { useDataset } from "@/contexts/dataset-context";
<<<<<<< HEAD
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { updateDataset } from "@/lib/firestore";
import { extractCsvSample } from "@/lib/dataset-utils";
=======
import { useToast } from "@/hooks/use-toast";
import { updateDataset } from "@/lib/firestore";
import { computeKpis } from "@/lib/compute-kpis";
>>>>>>> feature/no-ai

const iconMap = {
    DollarSign,
    Users,
    CreditCard,
    ShoppingBasket,
};

const iconBgMap: Record<string, string> = {
    DollarSign: "bg-green-500/15 text-green-400",
    Users: "bg-blue-500/15 text-blue-400",
    CreditCard: "bg-purple-500/15 text-purple-400",
    ShoppingBasket: "bg-orange-500/15 text-orange-400",
};

const cardGradients: string[] = [
    "from-green-500/5 to-transparent",
    "from-blue-500/5 to-transparent",
    "from-purple-500/5 to-transparent",
    "from-orange-500/5 to-transparent",
];

export default function OverviewTab() {
    const { selectedDataset } = useDataset();
<<<<<<< HEAD
    const { user } = useAuth();
=======
>>>>>>> feature/no-ai
    const { toast } = useToast();
    const [retrying, setRetrying] = useState(false);
    const kpiData = selectedDataset?.kpis;

    const handleRetryKpis = async () => {
<<<<<<< HEAD
        if (!selectedDataset || !user || !selectedDataset.headerMap) return;
        setRetrying(true);
        try {
            const csvData = extractCsvSample(
                selectedDataset.content,
                selectedDataset.headerMap,
            );
            const idToken = await user.getIdToken();
            const response = await fetch("/api/ai/generate-kpis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    datasetId: selectedDataset.id,
                    csvData,
                }),
            });
            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                throw new Error(errBody?.error || response.statusText);
            }
            const kpiResult = await response.json();
            const kpisWithChange = kpiResult.kpis.map((k: any) => ({
                ...k,
                change: "",
            }));
            await updateDataset(selectedDataset.id, { kpis: kpisWithChange });
=======
        if (!selectedDataset || !selectedDataset.headerMap) return;
        setRetrying(true);
        try {
            const kpis = computeKpis(
                selectedDataset.content,
                selectedDataset.headerMap,
            );
            await updateDataset(selectedDataset.id, { kpis });
>>>>>>> feature/no-ai
            toast({
                title: "KPIs Generated",
                description: `KPIs are now available for ${selectedDataset.filename}.`,
            });
        } catch (error: any) {
            console.error("KPI retry failed:", error);
            toast({
                title: "KPI Generation Failed",
                description:
                    error?.message ||
                    "Could not generate KPIs. Please try again.",
                variant: "destructive",
            });
        } finally {
            setRetrying(false);
        }
    };

    return (
        <div className="space-y-6">
            {selectedDataset ? (
                <p className="text-sm text-muted-foreground">
                    Showing KPIs for{" "}
                    <span className="font-semibold text-foreground">
                        {selectedDataset?.filename}
                    </span>
                </p>
            ) : (
                <p className="text-sm text-muted-foreground">
                    Select a dataset from the Uploads tab to see an overview.
                </p>
            )}

            {kpiData && kpiData.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {kpiData.map((kpi, index) => {
                        const Icon =
                            iconMap[kpi.icon as keyof typeof iconMap] ||
                            DollarSign;
                        const iconStyle =
                            iconBgMap[kpi.icon as string] ||
                            "bg-primary/10 text-primary";
                        const gradient =
                            cardGradients[index % cardGradients.length];
                        return (
                            <Card
                                key={index}
                                className="relative overflow-hidden group hover:shadow-md transition-all duration-300 shadow-sm"
                            >
                                {/* Gradient background overlay - visible always, stronger on hover */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                                />
                                <div className="absolute inset-0 bg-grid-pattern-subtle opacity-15 group-hover:opacity-30 transition-opacity duration-300" />
                                <div className="geo-shape geo-ring w-[60px] h-[60px] -top-4 -right-4 opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="geo-shape geo-circle-filled w-[10px] h-[10px] bottom-3 left-4 opacity-30" />
                                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {kpi.title}
                                    </CardTitle>
                                    <div
                                        className={`flex items-center justify-center h-9 w-9 rounded-xl ${iconStyle} transition-transform group-hover:scale-110`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="text-2xl font-bold tracking-tight">
                                        {kpi.value}
                                    </div>
                                    {kpi.description && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {kpi.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card className="relative overflow-hidden">
                    {/* Decorative background for empty state */}
                    <div className="absolute inset-0 bg-grid-pattern-subtle opacity-50" />
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/4" />

                    <CardContent className="relative h-72 flex flex-col items-center justify-center text-center">
                        {selectedDataset &&
                        selectedDataset.status !== "Completed" ? (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
                                    <Loader2 className="relative h-12 w-12 text-primary animate-spin" />
                                </div>
                                <p className="text-muted-foreground mt-6 text-sm font-medium">
                                    Processing your data...
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    Generating KPIs from your dataset
                                </p>
                            </>
                        ) : selectedDataset &&
                          selectedDataset.status === "Completed" ? (
                            <>
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 mb-5">
                                    <XCircle className="h-8 w-8 text-orange-400" />
                                </div>
                                <p className="text-foreground font-medium text-sm">
                                    KPI generation failed
                                </p>
                                <p className="text-muted-foreground text-sm max-w-sm mt-1">
                                    Could not generate KPIs for{" "}
                                    <span className="font-semibold text-foreground">
                                        {selectedDataset.filename}
                                    </span>
                                    . You can retry generating them below.
                                </p>
                                {selectedDataset.headerMap && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={handleRetryKpis}
                                        disabled={retrying}
                                    >
                                        {retrying ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                        )}
                                        {retrying
                                            ? "Generating KPIs..."
                                            : "Retry KPI Generation"}
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-5">
                                    <Inbox className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-foreground font-medium text-sm">
                                    No dataset selected
                                </p>
                                <p className="text-muted-foreground text-sm max-w-sm mt-1">
                                    Key Performance Indicators will appear here
                                    once you select a processed dataset from the
                                    Uploads tab.
                                </p>
                                <div className="flex items-center gap-1.5 mt-4 text-xs text-primary font-medium">
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                    Go to Uploads tab to get started
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
