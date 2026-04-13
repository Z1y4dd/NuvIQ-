import { ai } from "@/ai/genkit";
import { withRetries } from "@/ai/utils";
import { z } from "zod";

const GenerateSuggestionsInputSchema = z.object({
    datasetId: z.string().describe("The ID of the dataset to analyze."),
    csvData: z
        .string()
        .describe(
            "A CSV sample of the dataset including headers and up to 200 rows.",
        ),
    availableColumns: z
        .array(z.string())
        .describe(
            "List of column names that are mapped and available in the dataset.",
        ),
});
export type GenerateSuggestionsInput = z.infer<
    typeof GenerateSuggestionsInputSchema
>;

const AiSuggestionSchema = z.object({
    area: z
        .enum(["sales_revenue", "inventory", "marketing", "customer_retention"])
        .describe("The business area this suggestion relates to."),
    title: z
        .string()
        .describe("A short, actionable title for this suggestion."),
    narrative: z
        .string()
        .describe(
            "A 2-4 sentence narrative paragraph explaining the insight and recommended action.",
        ),
    priority: z
        .enum(["high", "medium", "low"])
        .describe("The priority level of this suggestion."),
});

const GenerateSuggestionsOutputSchema = z.object({
    suggestions: z
        .array(AiSuggestionSchema)
        .describe("A list of AI-generated business suggestions."),
});
export type GenerateSuggestionsOutput = z.infer<
    typeof GenerateSuggestionsOutputSchema
>;

export async function generateSuggestions(
    input: GenerateSuggestionsInput,
): Promise<GenerateSuggestionsOutput> {
    return generateSuggestionsFlow(input);
}

const generateSuggestionsPrompt = ai.definePrompt({
    name: "generateSuggestionsPrompt",
    input: { schema: GenerateSuggestionsInputSchema },
    output: { schema: GenerateSuggestionsOutputSchema },
    model: "googleai/gemini-2.5-flash",
    config: {
        responseMimeType: "application/json",
    },
    prompt: `You are an expert business analyst specializing in retail and e-commerce.

Your task is to analyze the sales data below and generate practical, narrative business suggestions.
Only generate suggestions for areas that are supported by the available columns listed.

Column availability rules:
- "sales_revenue": only if BOTH "date" AND "total revenue" columns are available
- "inventory": only if BOTH "product name" AND "quantity" columns are available
- "marketing": only if "category" OR ("product name" AND "invoiceid") columns are available
- "customer_retention": only if "customer id" column is available

Available columns in this dataset: {{{availableColumns}}}

Dataset ID: {{{datasetId}}}

--- BEGIN CSV DATA ---
{{{csvData}}}
--- END CSV DATA ---

For each applicable business area, write one suggestion with:
- A concise, actionable title (e.g. "Capitalize on Peak Revenue Days")
- A 2-4 sentence narrative explaining what the data shows and what action to take
- A priority level (high, medium, or low) based on potential business impact

Base your suggestions strictly on patterns you observe in the data. Do not invent data points.
Return between 2 and 4 suggestions total, covering only the areas the data supports.`,
});

const generateSuggestionsFlow = ai.defineFlow(
    {
        name: "generateSuggestionsFlow",
        inputSchema: GenerateSuggestionsInputSchema,
        outputSchema: GenerateSuggestionsOutputSchema,
    },
    async (input) => {
        const result = await withRetries(async () => {
            const { output } = await generateSuggestionsPrompt(input);
            return output!;
        });
        return result;
    },
);
