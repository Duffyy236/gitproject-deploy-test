// src/shared/hooks/useAsync.ts
// Purpose: Reusable hook to run an async function with loading/error/value state,
//          optional immediate execution, dependency tracking, and abort support.
//
// Usage examples:
//
// 1) Manual execution
// const { execute, loading, error, value } = useAsync(async () => {
//   const res = await api.get<User>('/me');
//   return res;
// });
// // later: await execute()
//
// 2) Immediate execution on mount or when deps change
// const { loading } = useAsync(
//   async () => api.get<Project[]>('/projects'),
//   { immediate: true, deps: [someId], onSuccess: setProjects }
// );
//
// 3) With AbortController (pass signal to your API)
// const { execute, cancel } = useAsync(
//   async (signal) => api.get<Project[]>('/projects', { signal }),
//   { withAbort: true, immediate: true }
// );

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Async function can optionally accept an AbortSignal as the first argument
type AsyncFn<T> =
    | ((signal: AbortSignal) => Promise<T>)
    | (() => Promise<T>);

type UseAsyncOptions<T> = {
    immediate?: boolean;           // run automatically on mount / deps change
    deps?: any[];                  // dependencies for the immediate run
    withAbort?: boolean;           // create an AbortController and pass its signal
    onSuccess?: (value: T) => void;
    onError?: (err: unknown) => void;
};

type UseAsyncResult<T> = {
    execute: () => Promise<T | undefined>;
    loading: boolean;
    error: unknown;
    value: T | undefined;
    reset: () => void;
    cancel: () => void;
};

export default function useAsync<T>(
    asyncFn: AsyncFn<T>,
    options: UseAsyncOptions<T> = {}
): UseAsyncResult<T> {
    const { immediate = false, deps = [], withAbort = false, onSuccess, onError } = options;

    const [loading, setLoading] = useState<boolean>(Boolean(immediate));
    const [error, setError] = useState<unknown>(null);
    const [value, setValue] = useState<T | undefined>(undefined);

    // Track mount status to avoid setState after unmount
    const mountedRef = useRef<boolean>(false);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Keep a stable ref to the latest callbacks and asyncFn
    const fnRef = useRef(asyncFn);
    const successRef = useRef(onSuccess);
    const errorRef = useRef(onError);

    useEffect(() => {
        fnRef.current = asyncFn;
    }, [asyncFn]);

    useEffect(() => {
        successRef.current = onSuccess;
    }, [onSuccess]);

    useEffect(() => {
        errorRef.current = onError;
    }, [onError]);

    // Abort controller for optional cancellation
    const abortRef = useRef<AbortController | null>(null);

    const cancel = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        if (!mountedRef.current) return;
        setLoading(false);
        setError(null);
        setValue(undefined);
    }, []);

    const execute = useCallback(async (): Promise<T | undefined> => {
        // Cancel any in-flight request
        cancel();

        const controller = withAbort ? new AbortController() : null;
        if (withAbort) {
            abortRef.current = controller!;
        }

        if (mountedRef.current) {
            setLoading(true);
            setError(null);
        }

        try {
            // If withAbort, pass signal as first arg; otherwise call without args
            const maybeSignal = withAbort ? (controller as AbortController).signal : undefined;

            const result = withAbort
                ? await (fnRef.current as (signal: AbortSignal) => Promise<T>)(maybeSignal!)
                : await (fnRef.current as () => Promise<T>)();

            if (!mountedRef.current) return undefined;

            setValue(result);
            successRef.current?.(result);
            return result;
        } catch (err) {
            // Ignore abort errors silently
            const isAborted =
                (err as any)?.name === 'AbortError' ||
                (err as any)?.message === 'canceled' ||
                (err as any)?.code === 'ERR_CANCELED';

            if (!mountedRef.current) return undefined;
            if (!isAborted) {
                setError(err);
                errorRef.current?.(err);
            }
            return undefined;
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
            // Clear controller when finished
            if (abortRef.current) {
                abortRef.current = null;
            }
        }
    }, [cancel, withAbort]);

    // Immediate run effect
    useEffect(() => {
        if (!immediate) return;
        void execute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [immediate, execute, ...deps]);

    // Cleanup on unmount (cancel in-flight)
    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

    return useMemo(
        () => ({ execute, loading, error, value, reset, cancel }),
        [execute, loading, error, value, reset, cancel]
    );
}
