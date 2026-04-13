"use client";
import { use } from "react";
import { useDataset } from "@/contexts/dataset-context";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
    ArrowLeft,
    Calendar,
    Database,
    FileText,
    CheckCircle2,
    Loader2,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import SuggestionsPanel from "@/components/dashboard/suggestions-panel";

const statusConfig: Record<
    string,
    { icon: React.ReactNode; className: string }
> = {
    Completed: {
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        className: "bg-green-500/10 text-green-600 border-green-200",
    },
    Processing: {
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
        className: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    },
    Failed: {
        icon: <XCircle className="h-3.5 w-3.5" />,
        className: "bg-red-500/10 text-red-600 border-red-200",
    },
};

export default function DatasetDetailsPage({
    params,
}: {
    params: Promise<{ datasetId: string }>;
}) {
    const { datasetId } = use(params);
    const { uploads } = useDataset();
    const dataset = uploads.find((d) => d.id === datasetId);

    if (!dataset) {
        return (
            <div className="space-y-4">
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="rounded-lg"
                >
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                        Back to Dashboard
                    </Link>
                </Button>
                <Card>
                    <CardContent className="h-40 flex flex-col items-center justify-center text-center">
                        <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-muted mb-3">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium">Dataset Not Found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            The dataset with ID: {datasetId} could not be found.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const headers = dataset.content?.[0] || [];
    const previewRows = dataset.content?.slice(1, 11) || [];
    const config = statusConfig[dataset.status];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="rounded-lg -ml-3 mb-1"
                    >
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight font-headline">
                        {dataset.filename}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Dataset details and data preview
                    </p>
                </div>
            </div>

            {/* Metadata Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">
                                Status
                            </p>
                            {config ? (
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border mt-0.5 ${config.className}`}
                                >
                                    {config.icon}
                                    {dataset.status}
                                </span>
                            ) : (
                                <p className="text-sm font-medium">
                                    {dataset.status}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10 text-accent">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">
                                Date Uploaded
                            </p>
                            <p className="text-sm font-semibold mt-0.5">
                                {new Date(dataset.date).toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    },
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-chart-3/10 text-chart-3">
                            <Database className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">
                                Record Count
                            </p>
                            <p className="text-sm font-semibold mt-0.5">
                                {dataset.recordCount.toLocaleString()} rows
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Preview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Data Preview</CardTitle>
                    <CardDescription>
                        Showing the first 10 rows of the dataset
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    {headers.map((header, index) => (
                                        <TableHead
                                            key={index}
                                            className="font-semibold"
                                        >
                                            {header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {previewRows.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {row.map((cell, cellIndex) => (
                                            <TableCell
                                                key={cellIndex}
                                                className="truncate max-w-[200px] text-sm"
                                            >
                                                {cell}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* AI Suggestions */}
            <SuggestionsPanel dataset={dataset} />
        </div>
    );
}
