import { NextRequest, NextResponse } from "next/server";
import {
    generateTimeSeriesForecast,
    type GenerateTimeSeriesForecastOutput,
} from "@/ai/flows/generate-time-series-forecast";
import { verifyAuthToken } from "@/lib/auth-api";

export async function POST(req: NextRequest) {
    try {
        // 1. Verify auth
        const authResult = await verifyAuthToken(req);
        if (authResult instanceof NextResponse) return authResult;

        // 2. Parse body
        const body = await req.json();
        const datasetId = body?.datasetId;
        const forecastDays = body?.forecastDays;
        const csvData = body?.csvData;

        if (!datasetId || typeof datasetId !== "string") {
            return NextResponse.json(
                { error: "datasetId (string) is required" },
                { status: 400 },
            );
        }

        if (
            !Array.isArray(forecastDays) ||
            forecastDays.some((d: any) => typeof d !== "number")
        ) {
            return NextResponse.json(
                { error: "forecastDays (number[]) is required" },
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
        const result: GenerateTimeSeriesForecastOutput =
            await generateTimeSeriesForecast({
                datasetId,
                forecastDays,
                csvData,
            });

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in generate-forecast API:", error);
        return NextResponse.json(
            { error: error?.message ?? "Failed to generate forecast" },
            { status: 500 },
        );
    }
}
