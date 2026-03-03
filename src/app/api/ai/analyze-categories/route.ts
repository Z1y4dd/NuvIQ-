import { NextRequest, NextResponse } from "next/server";
import {
    analyzeCategories,
    type AnalyzeCategoriesInput,
    type AnalyzeCategoriesOutput,
} from "@/ai/flows/analyze-categories";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as Partial<AnalyzeCategoriesInput>;

        if (!body.datasetId || typeof body.datasetId !== "string") {
            return NextResponse.json(
                { error: "datasetId (string) is required" },
                { status: 400 },
            );
        }

        const result: AnalyzeCategoriesOutput = await analyzeCategories({
            datasetId: body.datasetId,
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in analyze-categories API:", error);
        return NextResponse.json(
            { error: error?.message ?? "Failed to analyze categories" },
            { status: 500 },
        );
    }
}
