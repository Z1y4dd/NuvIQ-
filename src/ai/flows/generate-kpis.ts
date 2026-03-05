/**
 * @fileOverview Generates Key Performance Indicators (KPIs) from a dataset.
 *
 * - generateKpis - A function that triggers the KPI generation process.
 * - GenerateKpisInput - The input type for the generateKpis function
 * - GenerateKpisOutput - The return type for the generateKpis function.
 */

import { ai } from "@/ai/genkit";
import { withRetries } from "@/ai/utils";
import { z } from "zod";

const GenerateKpisInputSchema = z.object({
    datasetId: z.string().describe("The ID of the dataset to analyze."),
    csvData: z
        .string()
        .describe(
            "A CSV sample of the dataset including headers and up to 200 rows.",
        ),
});
export type GenerateKpisInput = z.infer<typeof GenerateKpisInputSchema>;

const GenerateKpisOutputSchema = z.object({
    kpis: z
        .array(
            z.object({
                title: z.string().describe("The title of the KPI."),
                value: z.string().describe("The value of the KPI."),
                icon: z
                    .string()
                    .describe(
                        "The icon to display for the KPI (e.g., DollarSign, Users).",
                    ),
                description: z
                    .string()
                    .describe("A brief description of the KPI."),
            }),
        )
        .describe("A list of Key Performance Indicators."),
});
export type GenerateKpisOutput = z.infer<typeof GenerateKpisOutputSchema>;

export async function generateKpis(
    input: GenerateKpisInput,
): Promise<GenerateKpisOutput> {
    return generateKpisFlow(input);
}

const generateKpisPrompt = ai.definePrompt({
    name: "generateKpisPrompt",
    input: { schema: GenerateKpisInputSchema },
    output: { schema: GenerateKpisOutputSchema },
    model: "googleai/gemini-2.5-flash",
    config: {
        responseMimeType: "application/json",
    },
    prompt: `You are an expert retail data analyst.

Your task is to compute 4 Key Performance Indicators (KPIs) from the CSV sales data provided below.
The KPIs should be:
1. Total Revenue (icon: 'DollarSign') — sum of the "total revenue" column.
2. Total Transactions (icon: 'CreditCard') — count of unique invoice IDs.
3. Unique Customers (icon: 'Users') — if a customer column exists, count distinct values; otherwise estimate from the data.
4. Avg. Items per Order (icon: 'ShoppingBasket') — average number of line items per unique invoice.

Analyze this real data carefully. If the sample below represents a subset, note that in descriptions.

Dataset ID: {{{datasetId}}}

--- BEGIN CSV DATA ---
{{{csvData}}}
--- END CSV DATA ---

Return the 4 KPIs in the specified JSON format.`,
});

const generateKpisFlow = ai.defineFlow(
    {
        name: "generateKpisFlow",
        inputSchema: GenerateKpisInputSchema,
        outputSchema: GenerateKpisOutputSchema,
    },
    async (input) => {
        const result = await withRetries(async () => {
            const { output } = await generateKpisPrompt(input);
            return output!;
        });
        return result;
    },
);
