/**
 * @fileOverview Generates time-series forecasts for sales data.
 *
 * - generateTimeSeriesForecast - A function that handles the time series forecast generation.
 * - GenerateTimeSeriesForecastInput - The input type for the generateTimeSeriesForecast function.
 * - GenerateTimeSeriesForecastOutput - The return type for the generateTimeSeriesForecast function.
 */

import { ai } from "@/ai/genkit";
import { withRetries } from "@/ai/utils";
import { z } from "zod";

const GenerateTimeSeriesForecastInputSchema = z.object({
    datasetId: z
        .string()
        .describe("The ID of the dataset to generate a forecast for."),
    forecastDays: z
        .array(z.number())
        .describe(
            "Array of integers representing the number of days to forecast (e.g., [7, 30, 90]).",
        ),
});
export type GenerateTimeSeriesForecastInput = z.infer<
    typeof GenerateTimeSeriesForecastInputSchema
>;

const ForecastResultSchema = z.object({
    date: z.string().describe("Date of the forecast."),
    predictedSales: z.number().describe("Predicted sales for the date."),
    confidenceIntervalLower: z
        .number()
        .describe("Lower bound of the confidence interval."),
    confidenceIntervalUpper: z
        .number()
        .describe("Upper bound of the confidence interval."),
});

const ForecastPeriodSchema = z.object({
    forecastDays: z
        .number()
        .describe("The number of days this forecast period covers."),
    results: z
        .array(ForecastResultSchema)
        .describe("The array of forecast data points for this period."),
});

const GenerateTimeSeriesForecastOutputSchema = z.object({
    forecasts: z
        .array(ForecastPeriodSchema)
        .describe(
            "An array of forecast periods, where each object contains the forecast days and the corresponding results.",
        ),
});

export type GenerateTimeSeriesForecastOutput = z.infer<
    typeof GenerateTimeSeriesForecastOutputSchema
>;

export async function generateTimeSeriesForecast(
    input: GenerateTimeSeriesForecastInput,
): Promise<GenerateTimeSeriesForecastOutput> {
    return generateTimeSeriesForecastFlow(input);
}

const generateTimeSeriesForecastPrompt = ai.definePrompt({
    name: "generateTimeSeriesForecastPrompt",
    input: { schema: GenerateTimeSeriesForecastInputSchema },
    output: { schema: GenerateTimeSeriesForecastOutputSchema },
    model: "googleai/gemini-2.5-flash",
    config: {
        responseMimeType: "application/json",
    },
    prompt: `You are an expert in time series analysis acting as a data simulation engine.

  Your task is to generate a realistic but synthetic sales forecast.
  You need to simulate trends and seasonality to produce a convincing forecast for each period specified in forecastDays.

  The forecast should be based on the provided dataset ID.

  Dataset ID: {{{datasetId}}}
  Forecast for the following periods: {{#each forecastDays}}{{{this}}} days{{#unless @last}}, {{/unless}}{{/each}}.

  Return a valid JSON object that adheres to the output schema, creating one entry in the 'forecasts' array for each value in the input 'forecastDays'.`,
});

const generateTimeSeriesForecastFlow = ai.defineFlow(
    {
        name: "generateTimeSeriesForecastFlow",
        inputSchema: GenerateTimeSeriesForecastInputSchema,
        outputSchema: GenerateTimeSeriesForecastOutputSchema,
    },
    async (input) => {
        const result = await withRetries(async () => {
            const { output } = await generateTimeSeriesForecastPrompt(input);
            return output!;
        });
        return result;
    },
);
