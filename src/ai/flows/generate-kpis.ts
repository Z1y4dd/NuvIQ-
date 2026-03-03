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
    prompt: `You are an expert retail analyst acting as a data simulation engine.

  Your task is to generate a realistic but synthetic set of 4 Key Performance Indicators (KPIs) for a given dataset.
  The KPIs should be:
  1. Total Revenue (icon: 'DollarSign')
  2. Total Transactions (icon: 'CreditCard')
  3. Unique Customers (icon: 'Users')
  4. Avg. Items per Order (icon: 'ShoppingBasket')

  Based on the dataset ID, create realistic values for these KPIs.

  Dataset ID: {{{datasetId}}}

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
