import { NextRequest, NextResponse } from "next/server";
import {
    generateKpis,
    type GenerateKpisOutput,
} from "@/ai/flows/generate-kpis";

export const maxDuration = 60;
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
        const result: GenerateKpisOutput = await generateKpis({
            datasetId,
            csvData,
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
