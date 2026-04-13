"use client";
import { useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Sparkles,
    TrendingUp,
    Package,
    Megaphone,
    Users,
    Inbox,
    RefreshCw,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { Upload } from "@/lib/data";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { extractCsvSample } from "@/lib/dataset-utils";
import { formatDistanceToNow } from "date-fns";

const areaConfig = {
    sales_revenue: {
        label: "Sales & Revenue",
        icon: TrendingUp,
        badgeClass: "bg-green-500/15 text-green-400 border-green-500/30",
        iconClass: "bg-green-500/15 text-green-400",
    },
    inventory: {
        label: "Inventory",
        icon: Package,
        badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        iconClass: "bg-blue-500/15 text-blue-400",
    },
    marketing: {
        label: "Marketing",
        icon: Megaphone,
        badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        iconClass: "bg-purple-500/15 text-purple-400",
    },
    customer_retention: {
        label: "Customer Retention",
        icon: Users,
        badgeClass: "bg-orange-500/15 text-orange-400 border-orange-500/30",
        iconClass: "bg-orange-500/15 text-orange-400",
    },
};

const priorityConfig = {
    high: {
        label: "High Priority",
        class: "bg-red-500/15 text-red-400 border-red-500/30",
    },
    medium: {
        label: "Medium Priority",
        class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    },
    low: {
        label: "Low Priority",
        class: "bg-muted text-muted-foreground border-border",
    },
};

interface SuggestionsPanelProps {
    dataset: Upload | null;
}

export default function SuggestionsPanel({ dataset }: SuggestionsPanelProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [generating, setGenerating] = useState(false);

    const suggestions = dataset?.suggestions;
    const isProcessing = dataset?.status === "Processing";

    const callGenerateSuggestions = async () => {
        if (!user || !dataset?.headerMap) return;
        setGenerating(true);
        try {
            const csvData = extractCsvSample(
                dataset.content,
                dataset.headerMap,
            );
            const availableColumns = Object.keys(dataset.headerMap);
            const token = await user.getIdToken();
            const res = await fetch("/api/ai/generate-suggestions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    datasetId: dataset.id,
                    csvData,
                    availableColumns,
                }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            toast({
                title: "Suggestions Ready",
                description: "AI suggestions have been generated.",
            });
        } catch (error: any) {
            console.error("Generate suggestions failed:", error);
            toast({
                title: "Generation Failed",
                description:
                    error?.message || "Could not generate suggestions.",
                variant: "destructive",
            });
        } finally {
            setGenerating(false);
        }
    };

    // No dataset selected
    if (!dataset) {
        return (
            <Card className="relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.02] pointer-events-none" />
                <CardHeader className="relative">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg">
                            AI Suggestions
                        </CardTitle>
                    </div>
                    <CardDescription>
                        AI-powered business insights based on your dataset
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                        <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-muted mb-3">
                            <Inbox className="h-6 w-6" />
                        </div>
                        <p className="font-medium text-foreground text-sm">
                            No dataset selected
                        </p>
                        <p className="text-xs mt-1">
                            Select a completed dataset to view AI suggestions
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Dataset is still processing — show skeletons
    if (isProcessing) {
        return (
            <Card className="relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.02] pointer-events-none" />
                <CardHeader className="relative">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                        <CardTitle className="text-lg">
                            AI Suggestions
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Generating insights from your dataset…
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="rounded-xl border p-4 space-y-2"
                        >
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-24 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    // Dataset completed but no suggestions yet
    if (!suggestions && dataset.status === "Completed") {
        return (
            <Card className="relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.02] pointer-events-none" />
                <CardHeader className="relative">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg">
                            AI Suggestions
                        </CardTitle>
                    </div>
                    <CardDescription>
                        AI-powered business insights based on your dataset
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-40 text-center gap-3">
                        <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-muted">
                            <AlertCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">
                                Suggestions not generated yet
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Generate AI-powered insights for{" "}
                                <span className="font-medium text-foreground">
                                    {dataset.filename}
                                </span>
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={callGenerateSuggestions}
                            disabled={generating}
                            className="rounded-lg"
                        >
                            {generating ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Generate Suggestions
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!suggestions) return null;

    return (
        <Card className="relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.02] pointer-events-none" />
            <div className="geo-shape geo-ring w-[110px] h-[110px] -top-8 -right-8 opacity-25" />
            <CardHeader className="relative flex flex-row items-start justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg">
                            AI Suggestions
                        </CardTitle>
                    </div>
                    <CardDescription>
                        {suggestions.suggestions.length} insight
                        {suggestions.suggestions.length !== 1
                            ? "s"
                            : ""} for{" "}
                        <span className="font-medium text-foreground">
                            {dataset.filename}
                        </span>
                        {" · "}
                        <span className="text-xs">
                            Updated{" "}
                            {formatDistanceToNow(
                                new Date(suggestions.generatedAt),
                                {
                                    addSuffix: true,
                                },
                            )}
                        </span>
                    </CardDescription>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={callGenerateSuggestions}
                    disabled={generating}
                    className="rounded-lg shrink-0"
                >
                    {generating ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Regenerate
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {suggestions.suggestions.map((suggestion, index) => {
                    const area = areaConfig[suggestion.area];
                    const priority = priorityConfig[suggestion.priority];
                    const IconComponent = area?.icon ?? Sparkles;
                    return (
                        <div
                            key={index}
                            className="rounded-xl border bg-card/50 p-4 space-y-2.5 transition-colors hover:bg-muted/30"
                        >
                            <div className="flex items-center gap-2 flex-wrap">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${area?.badgeClass ?? ""}`}
                                >
                                    <IconComponent className="h-3 w-3" />
                                    {area?.label ?? suggestion.area}
                                </span>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${priority?.class ?? ""}`}
                                >
                                    {priority?.label ?? suggestion.priority}
                                </span>
                            </div>
                            <p className="font-semibold text-sm leading-snug">
                                {suggestion.title}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {suggestion.narrative}
                            </p>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
