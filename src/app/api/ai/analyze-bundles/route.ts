import { NextRequest, NextResponse } from "next/server";
import {
    analyzeMarketBasketAssociations,
    type AnalyzeMarketBasketAssociationsInput,
    type AnalyzeMarketBasketAssociationsOutput,
} from "@/ai/flows/analyze-market-basket-associations";

export async function POST(req: NextRequest) {
    try {
        const body =
            (await req.json()) as Partial<AnalyzeMarketBasketAssociationsInput>;

        if (!body.datasetId || typeof body.datasetId !== "string") {
            return NextResponse.json(
                { error: "datasetId (string) is required" },
                { status: 400 },
            );
        }

        const result: AnalyzeMarketBasketAssociationsOutput =
            await analyzeMarketBasketAssociations({
                datasetId: body.datasetId,
            });

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in analyze-bundles API:", error);
        return NextResponse.json(
            { error: error?.message ?? "Failed to analyze bundles" },
            { status: 500 },
        );
    }
}

