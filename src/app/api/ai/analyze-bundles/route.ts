import { NextRequest, NextResponse } from "next/server";
import {
    analyzeMarketBasketAssociations,
    type AnalyzeMarketBasketAssociationsOutput,
} from "@/ai/flows/analyze-market-basket-associations";
import { verifyAuthToken } from "@/lib/auth-api";

export async function POST(req: NextRequest) {
    try {
        // 1. Verify auth
        const authResult = await verifyAuthToken(req);
        if (authResult instanceof NextResponse) return authResult;

        // 2. Parse body
        const body = await req.json();
        const datasetId = body?.datasetId;
        const csvData = body?.csvData;

        if (!datasetId || typeof datasetId !== "string") {
            return NextResponse.json(
                { error: "datasetId (string) is required" },
                { status: 400 },
            );
        }

        if (!csvData || typeof csvData !== "string") {
            return NextResponse.json(
                { error: "csvData (string) is required" },
                { status: 400 },
            );
        }

        // 3. Run AI flow with real data
        const result: AnalyzeMarketBasketAssociationsOutput =
            await analyzeMarketBasketAssociations({
                datasetId,
                csvData,
            });

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error(
            "Error in analyze-bundles API:",
            error?.message,
            error?.stack,
        );
        return NextResponse.json(
            {
                error: error?.message ?? "Failed to analyze bundles",
                details: String(error),
            },
            { status: 500 },
        );
    }
}
