"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
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
import { Upload } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
    UploadCloud,
    MoreHorizontal,
    Loader2,
    CheckCircle2,
    XCircle,
    Inbox,
    Map,
    Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useDataset } from "@/contexts/dataset-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { createDataset, updateDataset, deleteDataset } from "@/lib/firestore";
import { parseCSV as parseCSVFile } from "@/lib/storage";

const statusConfig = {
    Completed: {
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        className: "bg-green-500/15 text-green-400 border-green-500/30",
    },
    Processing: {
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
        className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    },
    Failed: {
        icon: <XCircle className="h-3.5 w-3.5" />,
        className: "bg-red-500/15 text-red-400 border-red-500/30",
    },
    Mapping: {
        icon: <Map className="h-3.5 w-3.5" />,
        className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
};

const requiredColumns = {
    date: { aliases: ["date"], optional: false },
    "total revenue": {
        aliases: ["total revenue", "revenue", "price", "sales"],
        optional: false,
    },
    invoiceid: {
        aliases: ["invoiceid", "invoice no", "invoice", "transaction id"],
        optional: false,
    },
    "product name": {
        aliases: ["product name", "product", "item", "description"],
        optional: false,
    },
    quantity: { aliases: ["quantity", "qty"], optional: true },
    category: {
        aliases: ["category", "product category", "department"],
        optional: true,
    },
};

// Helper function to parse CSV content
const parseCSV = (content: string): string[][] => {
    return content
        .trim()
        .split("\n")
        .map((row) => row.split(","));
};

// Finds the best initial match for a required column from the CSV headers
const findBestMatch = (
    csvHeaders: string[],
    aliases: string[],
): string | undefined => {
    const lowerCaseHeaders = csvHeaders.map((h) => h.toLowerCase().trim());
    for (const alias of aliases) {
        const lowerAlias = alias.toLowerCase();
        const foundHeader = csvHeaders[lowerCaseHeaders.indexOf(lowerAlias)];
        if (foundHeader) return foundHeader;
    }
    return undefined;
};

export default function UploadsTable() {
    const [itemToDelete, setItemToDelete] = useState<Upload | null>(null);
    const [mappingCandidate, setMappingCandidate] = useState<Upload | null>(
        null,
    );
    const [currentMappings, setCurrentMappings] = useState<
        Record<string, string>
    >({});

    const fileInputRef = useRef<HTMLInputElement>(null);
    const initializedMappingIdRef = useRef<string | null>(null);
    const { toast } = useToast();
    const { selectedDataset, setSelectedDataset, uploads } = useDataset();
    const { user } = useAuth();

    const processUpload = async (
        upload: Upload,
        headerMap: Record<string, number>,
    ) => {
        if (!user) return;

        let failedCount = 0;

        await updateDataset(upload.id, { status: "Processing", headerMap });

        try {
            const response = await fetch("/api/ai/generate-kpis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ datasetId: upload.id }),
            });
            if (!response.ok)
                throw new Error(`KPI API failed: ${response.statusText}`);
            const kpiResult = await response.json();
            const kpisWithChange = kpiResult.kpis.map((k: any) => ({
                ...k,
                change: "",
            }));
            await updateDataset(upload.id, { kpis: kpisWithChange });
        } catch (error: any) {
            console.error("KPI generation failed:", error);
            toast({
                title: "KPI Generation Failed",
                description: `Could not generate KPIs for ${upload.filename}.`,
                variant: "destructive",
            });
            failedCount++;
        }

        try {
            const response = await fetch("/api/ai/generate-forecast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    datasetId: upload.id,
                    forecastDays: [7],
                }),
            });
            if (!response.ok)
                throw new Error(`Forecast API failed: ${response.statusText}`);
            const forecastResult = await response.json();
            const sevenDayForecast = forecastResult.forecasts.find(
                (f: any) => f.forecastDays === 7,
            );
            if (sevenDayForecast) {
                const forecastData =
                    sevenDayForecast.results.map((f: any) => ({
                        date: f.date,
                        sales: null,
                        predicted: f.predictedSales,
                        lower: f.confidenceIntervalLower,
                        upper: f.confidenceIntervalUpper,
                    })) || [];
                await updateDataset(upload.id, { forecast: forecastData });
            } else {
                throw new Error("7-day forecast not found in AI response.");
            }
        } catch (error: any) {
            console.error("Forecast generation failed:", error);
            toast({
                title: "Forecast Failed",
                description: `Could not generate forecast for ${upload.filename}.`,
                variant: "destructive",
            });
            failedCount++;
        }

        try {
            const response = await fetch("/api/ai/analyze-bundles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ datasetId: upload.id }),
            });
            if (!response.ok)
                throw new Error(`Bundles API failed: ${response.statusText}`);
            const bundlesResult = await response.json();
            await updateDataset(upload.id, {
                bundles: bundlesResult.associationRules,
            });
        } catch (error: any) {
            console.error("Market basket analysis failed:", error);
            toast({
                title: "Bundle Analysis Failed",
                description: `Could not generate product bundles for ${upload.filename}.`,
                variant: "destructive",
            });
            failedCount++;
        }

        if (headerMap["category"] !== undefined) {
            try {
                const response = await fetch("/api/ai/analyze-categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ datasetId: upload.id }),
                });
                if (!response.ok)
                    throw new Error(
                        `Categories API failed: ${response.statusText}`,
                    );
                const categoriesResult = await response.json();
                await updateDataset(upload.id, {
                    categories: categoriesResult.categories,
                });
            } catch (error: any) {
                console.error("Category analysis failed:", error);
                toast({
                    title: "Category Analysis Failed",
                    description: `Could not generate category performance for ${upload.filename}.`,
                    variant: "destructive",
                });
                failedCount++;
            }
        }

        const totalTasks = 3 + (headerMap["category"] !== undefined ? 1 : 0);
        const finalStatus: Upload["status"] =
            failedCount === totalTasks ? "Failed" : "Completed";
        await updateDataset(upload.id, { status: finalStatus });

        if (failedCount > 0 && finalStatus === "Completed") {
            toast({
                title: "Processing Partially Complete",
                description: `Some analyses failed for ${upload.filename}. Available results are shown.`,
                variant: "destructive",
            });
        } else if (finalStatus === "Failed") {
            toast({
                title: "Processing Failed",
                description: `All analyses failed for ${upload.filename}. Check console for details.`,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Processing Complete",
                description: `${upload.filename} is ready to view.`,
            });
            // Do NOT call setSelectedDataset here with stale closure `uploads`.
            // The Firestore real-time subscription in DatasetContext will auto-select
            // this dataset with fresh data once its status becomes "Completed".
        }
    };

    useEffect(() => {
        const toMap = uploads.find((u) => u.status === "Mapping");
        if (!toMap) {
            initializedMappingIdRef.current = null;
            return;
        }
        if (toMap.id !== initializedMappingIdRef.current) {
            initializedMappingIdRef.current = toMap.id;
            setMappingCandidate(toMap);
            const csvHeaders = toMap.content[0] || [];
            const initialMappings: Record<string, string> = {};
            Object.entries(requiredColumns).forEach(([key, { aliases }]) => {
                initialMappings[key] = "none";
                const bestMatch = findBestMatch(csvHeaders, aliases);
                if (bestMatch) initialMappings[key] = bestMatch;
            });
            setCurrentMappings(initialMappings);
        }
    }, [uploads]);

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;
        try {
            const { headers, data } = await parseCSVFile(file);
            const parsedContent = [headers, ...data];
            const recordCount = data.length;
            await createDataset(user.uid, {
                filename: file.name,
                date: new Date().toISOString().split("T")[0],
                status: "Mapping",
                recordCount,
                content: parsedContent,
            });
            toast({
                title: "File Uploaded",
                description: `${file.name} is ready for column mapping.`,
            });
        } catch (error: any) {
            console.error("Upload failed:", error);
            toast({
                title: "Upload Failed",
                description: error.message || "Could not upload file",
                variant: "destructive",
            });
        }
        event.target.value = "";
    };

    const handleDelete = async (upload: Upload) => {
        try {
            await deleteDataset(upload.id);
            if (selectedDataset?.id === upload.id) setSelectedDataset(null);
            toast({
                title: "Dataset Deleted",
                description: "The selected dataset has been removed.",
            });
        } catch (error: any) {
            console.error("Delete failed:", error);
            toast({
                title: "Delete Failed",
                description: error.message || "Could not delete dataset",
                variant: "destructive",
            });
        }
    };

    const handleConfirmMapping = () => {
        if (!mappingCandidate) return;
        const csvHeaders = mappingCandidate.content[0].map((h) => h.trim());
        const headerMap: Record<string, number> = {};
        const missing: string[] = [];
        Object.keys(requiredColumns).forEach((key) => {
            const selectedHeader = currentMappings[key];
            if (selectedHeader && selectedHeader !== "none") {
                headerMap[key] = csvHeaders.indexOf(selectedHeader);
            } else if (
                !requiredColumns[key as keyof typeof requiredColumns].optional
            ) {
                missing.push(key);
            }
        });
        if (missing.length > 0) {
            toast({
                title: "Mapping Incomplete",
                description: `Please map the following required fields: ${missing.join(", ")}`,
                variant: "destructive",
            });
            return;
        }
        processUpload(mappingCandidate, headerMap);
        setMappingCandidate(null);
    };

    const handleCancelMapping = () => {
        if (mappingCandidate) handleDelete(mappingCandidate);
        setMappingCandidate(null);
    };

    const getLinkPath = (uploadId: string) => `/dashboard/datasets/${uploadId}`;
    const csvHeaders = mappingCandidate?.content[0] || [];

    return (
        <>
            <Card className="relative overflow-hidden shadow-sm">
                {/* Card background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.02] pointer-events-none" />
                <div className="absolute inset-0 bg-grid-pattern-subtle opacity-20 pointer-events-none" />
                <div className="geo-shape geo-ring w-[110px] h-[110px] -top-8 -right-8 opacity-25" />
                <div className="geo-shape geo-square w-[20px] h-[20px] bottom-4 left-6 opacity-30" />
                <CardHeader className="relative flex flex-row items-start justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                                <UploadCloud className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-lg">
                                Dataset Uploads
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Manage your uploaded sales data. Select a dataset to
                            activate it for analysis.
                        </CardDescription>
                    </div>
                    <Button
                        onClick={handleUploadClick}
                        disabled={!!mappingCandidate}
                        size="sm"
                        className="rounded-lg"
                    >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Upload Dataset
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".csv"
                    />
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead className="font-semibold">
                                        Filename
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Date Uploaded
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Records
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-12">
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {uploads.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-40 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-muted">
                                                    <Inbox className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">
                                                        No datasets yet
                                                    </p>
                                                    <p className="text-xs mt-0.5">
                                                        Upload a CSV file to get
                                                        started with analysis
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    uploads.map((upload) => (
                                        <TableRow
                                            key={upload.id}
                                            className={cn(
                                                "cursor-pointer transition-colors",
                                                selectedDataset?.id ===
                                                    upload.id
                                                    ? "bg-primary/5"
                                                    : "hover:bg-muted/50",
                                            )}
                                            onClick={() =>
                                                setSelectedDataset(upload)
                                            }
                                        >
                                            <TableCell>
                                                {selectedDataset?.id ===
                                                    upload.id && (
                                                    <div className="flex items-center justify-center">
                                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                                        <span className="sr-only">
                                                            Selected Dataset
                                                        </span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {upload.filename}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {upload.date}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {upload.recordCount.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const config =
                                                        statusConfig[
                                                            upload.status as keyof typeof statusConfig
                                                        ];
                                                    return config ? (
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${config.className}`}
                                                        >
                                                            {config.icon}
                                                            {upload.status}
                                                        </span>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            {upload.status}
                                                        </Badge>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            aria-haspopup="true"
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                Toggle menu
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={getLinkPath(
                                                                    upload.id,
                                                                )}
                                                            >
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {upload.status !==
                                                            "Completed" &&
                                                            upload.status !==
                                                                "Processing" && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        setMappingCandidate(
                                                                            upload,
                                                                        )
                                                                    }
                                                                >
                                                                    Map Columns
                                                                </DropdownMenuItem>
                                                            )}
                                                        {upload.headerMap && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    processUpload(
                                                                        upload,
                                                                        upload.headerMap!,
                                                                    )
                                                                }
                                                                disabled={
                                                                    upload.status ===
                                                                    "Processing"
                                                                }
                                                            >
                                                                Re-process
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() =>
                                                                setItemToDelete(
                                                                    upload,
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Column Mapping Dialog */}
            <Dialog
                open={!!mappingCandidate}
                onOpenChange={(open) => !open && handleCancelMapping()}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Map Your Data Columns</DialogTitle>
                        <DialogDescription>
                            Match the columns from{" "}
                            <span className="font-semibold text-foreground">
                                {mappingCandidate?.filename}
                            </span>{" "}
                            to the required fields for analysis.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {Object.entries(requiredColumns).map(
                            ([key, { optional }]) => (
                                <div
                                    key={key}
                                    className="grid grid-cols-3 items-center gap-4"
                                >
                                    <Label
                                        htmlFor={key}
                                        className="text-right capitalize text-sm"
                                    >
                                        {key}{" "}
                                        {!optional && (
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        )}
                                        {optional && (
                                            <span className="text-muted-foreground text-xs ml-1">
                                                (optional)
                                            </span>
                                        )}
                                    </Label>
                                    <Select
                                        value={currentMappings[key] ?? "none"}
                                        onValueChange={(value) =>
                                            setCurrentMappings((prev) => ({
                                                ...prev,
                                                [key]: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger
                                            id={key}
                                            className="col-span-2"
                                        >
                                            <SelectValue placeholder="Select a column..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                <span className="text-muted-foreground italic">
                                                    Skip this column
                                                </span>
                                            </SelectItem>
                                            {csvHeaders.map((header) => (
                                                <SelectItem
                                                    key={header}
                                                    value={header}
                                                >
                                                    {header}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ),
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={handleCancelMapping}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmMapping}>
                            Confirm & Process
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!itemToDelete}
                onOpenChange={(open) => !open && setItemToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete dataset?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete{" "}
                            <span className="font-semibold text-foreground">
                                {itemToDelete?.filename}
                            </span>
                            . This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                itemToDelete && handleDelete(itemToDelete)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
