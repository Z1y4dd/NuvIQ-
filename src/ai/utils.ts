/**
 * @fileOverview Provides utility functions for AI flows.
 */

/**
 * A simple utility to retry an async function if it fails.
 * @param fn The async function to execute.
 * @param retries The number of times to retry.
 * @param delay The delay between retries in milliseconds.
 * @returns A promise that resolves with the result of the function.
 */
export async function withRetries<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000,
): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            if (i < retries - 1) {
                await new Promise((resolve) =>
                    setTimeout(resolve, delay * (i + 1)),
                );
            }
        }
    }
    throw lastError;
}
