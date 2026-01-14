
import { AppError } from "../error/AppError";

interface RetryOptions {
    retries?: number;
    delay?: number;
    backoffFactor?: number;
    timeout?: number;
}

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        retries = 3,
        delay = 1000,
        backoffFactor = 2,
        timeout = 0
    } = options;

    let attempt = 0;

    const execute = async () => {
        try {
            // Respect timeout if set
            if (timeout > 0) {
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new AppError('Operation timed out', 'TIMEOUT')), timeout)
                );
                return await Promise.race([fn(), timeoutPromise]) as T;
            }
            return await fn();
        } catch (error: any) {
            // Don't retry if specifically requested not to
            if (error?.isOperational === false) throw error;

            attempt++;
            if (attempt > retries) {
                throw error;
            }

            const waitTime = delay * Math.pow(backoffFactor, attempt - 1);
            console.warn(`[Retry] Attempt ${attempt} failed. Retrying in ${waitTime}ms...`, error.message);

            await new Promise(resolve => setTimeout(resolve, waitTime));
            return execute();
        }
    };

    return execute();
}
