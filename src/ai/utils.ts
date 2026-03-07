/**
 * @fileOverview Provides utility functions for AI flows.
 */

/**
 * Extracts a "retry in Xs" duration from a Gemini 429 error message.
 * Returns the number of milliseconds to wait, or null if not found.
 */
function parseRetryAfter(message: string): number | null {
    // Matches patterns like "Please retry in 4.531815532s" or "retry in 45s"
    const match = message.match(/retry in ([\d.]+)s/i);
    if (match) {
        const seconds = parseFloat(match[1]);
        if (!isNaN(seconds) && seconds > 0) {
            // Add a 2-second buffer
            return (seconds + 2) * 1000;
        }
    }
    return null;
}

/**
 * A utility to retry an async function with rate-limit awareness.
 * If a 429 error is detected, automatically waits the suggested retry time.
 * @param fn The async function to execute.
 * @param retries The number of times to retry.
 * @param baseDelay The base delay between non-429 retries in milliseconds.
 * @returns A promise that resolves with the result of the function.
 */
export async function withRetries<T>(
    fn: () => Promise<T>,
    retries = 2,
    baseDelay = 5000,
): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            const msg = error?.message ?? String(error);
            console.error(
                `withRetries attempt ${i + 1}/${retries} failed:`,
                msg,
            );

            if (i < retries - 1) {
                // Check for 429 rate-limit and use the suggested wait time
                const is429 =
                    msg.includes("429") ||
                    msg.includes("Too Many Requests") ||
                    msg.includes("quota");
                const retryAfterMs = parseRetryAfter(msg);

                let waitMs: number;
                if (is429 && retryAfterMs) {
                    waitMs = retryAfterMs;
                } else if (is429) {
                    // 429 but no parseable wait time — wait 60s
                    waitMs = 60_000;
                } else {
                    // Non-rate-limit error — exponential backoff
                    waitMs = baseDelay * Math.pow(2, i);
                }

                console.log(`Retrying in ${Math.round(waitMs / 1000)}s...`);
                await new Promise((resolve) => setTimeout(resolve, waitMs));
            }
        }
    }
    throw lastError;
}
