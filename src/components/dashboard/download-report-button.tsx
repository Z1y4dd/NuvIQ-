"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import ReportDocument from "@/components/dashboard/report-document";
import type { Upload } from "@/lib/data";

interface DownloadReportButtonProps {
    dataset: Upload;
}

export default function DownloadReportButton({
    dataset,
}: DownloadReportButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    async function handleDownload() {
        setIsGenerating(true);
        try {
            const element = (
                <ReportDocument dataset={dataset} />
            ) as unknown as ReactElement<DocumentProps>;
            const blob = await pdf(element).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const baseName = dataset.filename.replace(/\.csv$/i, "");
            a.href = url;
            a.download = `${baseName}_report.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <Button
            onClick={handleDownload}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating…
                </>
            ) : (
                <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Report
                </>
            )}
        </Button>
    );
}
