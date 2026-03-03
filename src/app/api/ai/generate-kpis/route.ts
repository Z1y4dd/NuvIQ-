import { NextRequest, NextResponse } from "next/server";
import {
    generateKpis,
    type GenerateKpisInput,
    type GenerateKpisOutput,
} from "@/ai/flows/generate-kpis";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as Partial<GenerateKpisInput>;

        if (!body.datasetId || typeof body.datasetId !== "string") {
            return NextResponse.json(
                { error: "datasetId (string) is required" },
                { status: 400 },
            );
        }

        const result: GenerateKpisOutput = await generateKpis({
            datasetId: body.datasetId,
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error("Error in generate-kpis API:", error);
        return NextResponse.json(
            { error: error?.message ?? "Failed to generate KPIs" },
            { status: 500 },
        );
    }
}

