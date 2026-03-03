import { NextRequest, NextResponse } from "next/server";
import {
    generateTimeSeriesForecast,
    type GenerateTimeSeriesForecastInput,
    type GenerateTimeSeriesForecastOutput,
} from "@/ai/flows/generate-time-series-forecast";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as Partial<GenerateTimeSeriesForecastInput>;

        if (!body.datasetId || typeof body.datasetId !== "string") {
            return NextResponse.json(
                { error: "datasetId (string) is required" },
                { status: 400 },
            );
        }

        if (
            !Array.isArray(body.forecastDays) ||
            body.forecastDays.some((d) => typeof d !== "number")
        ) {
            return NextResponse.json(
                { error: "forecastDays (number[]) is required" },
                { status: 400 },
            );
        }

        const result: GenerateTimeSeriesForecastOutput =
            await generateTimeSeriesForecast({
                datasetId: body.datasetId,
                forecastDays: body.forecastDays,
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

