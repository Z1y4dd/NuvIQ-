/**
 * @fileOverview Analyzes product associations using the Apriori algorithm.
 *
 * - analyzeMarketBasketAssociations - A function that triggers the market basket analysis process.
 * - AnalyzeMarketBasketAssociationsInput - The input type for the analyzeMarketBasketAssociations function.
 * - AnalyzeMarketBasketAssociationsOutput - The return type for the analyzeMarketBasketAssociations function.
 */

import { ai } from "@/ai/genkit";
import { withRetries } from "@/ai/utils";
import { z } from "zod";

const AnalyzeMarketBasketAssociationsInputSchema = z.object({
    datasetId: z.string().describe("The ID of the dataset to analyze."),
    csvData: z
        .string()
        .describe(
            "A CSV sample of the dataset including headers and up to 200 rows.",
        ),
});
export type AnalyzeMarketBasketAssociationsInput = z.infer<
    typeof AnalyzeMarketBasketAssociationsInputSchema
>;

const AnalyzeMarketBasketAssociationsOutputSchema = z.object({
    associationRules: z
        .array(
            z.object({
                antecedents: z
                    .array(z.string())
                    .describe("Products typically found together"),
                consequents: z
                    .array(z.string())
                    .describe(
                        "Products likely to be purchased when antecedents are",
                    ),
                support: z
                    .number()
                    .describe(
                        "The proportion of transactions that contain the item set.",
                    ),
                confidence: z
                    .number()
                    .describe(
                        "The probability that a transaction containing antecedents also contains consequents.",
                    ),
                lift: z
                    .number()
                    .describe(
                        "The increase in the probability that a transaction containing antecedents also contains consequents.",
                    ),
            }),
        )
        .describe(
            "The association rules derived from the market basket analysis.",
        ),
});
export type AnalyzeMarketBasketAssociationsOutput = z.infer<
    typeof AnalyzeMarketBasketAssociationsOutputSchema
>;

export async function analyzeMarketBasketAssociations(
    input: AnalyzeMarketBasketAssociationsInput,
): Promise<AnalyzeMarketBasketAssociationsOutput> {
    return analyzeMarketBasketAssociationsFlow(input);
}

const analyzeMarketBasketAssociationsPrompt = ai.definePrompt({
    name: "analyzeMarketBasketAssociationsPrompt",
    input: { schema: AnalyzeMarketBasketAssociationsInputSchema },
    output: { schema: AnalyzeMarketBasketAssociationsOutputSchema },
    model: "googleai/gemini-2.5-flash",
    config: {
        responseMimeType: "application/json",
    },
    prompt: `You are an expert in market basket analysis.

Your task is to analyze the real transaction data below and find product associations using market basket analysis (Apriori-style).
Group items by "invoiceid" to build transaction baskets, then use the "product name" column to find which products are frequently purchased together.
Calculate support, confidence, and lift for each rule.

Dataset ID: {{{datasetId}}}

--- BEGIN CSV DATA ---
{{{csvData}}}
--- END CSV DATA ---

Return the top 10-15 association rules in the specified JSON format.`,
});

const analyzeMarketBasketAssociationsFlow = ai.defineFlow(
    {
        name: "analyzeMarketBasketAssociationsFlow",
        inputSchema: AnalyzeMarketBasketAssociationsInputSchema,
        outputSchema: AnalyzeMarketBasketAssociationsOutputSchema,
    },
    async (input) => {
        const result = await withRetries(async () => {
            const { output } =
                await analyzeMarketBasketAssociationsPrompt(input);
            return output!;
        });
        return result;
    },
);
