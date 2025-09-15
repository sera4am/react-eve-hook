import { useCallback, useEffect, useRef } from "react";
import mitt, { type Emitter, type Handler } from "mitt";

// Define event map type for type-safe events
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventMap = Record<string|symbol|number, any>;

// Global event emitter instance shared across all components
const emitter: Emitter<EventMap> = mitt<EventMap>();

// Type for event handler tracking
interface HandlerEntry<T extends EventMap = EventMap> {
    event: keyof T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: Handler<T[any]>;
}

// Hook return type
interface UseEveReturn<T extends EventMap = EventMap> {
    on: <K extends keyof T>(event: K, handler: Handler<T[K]>) => void;
    off: <K extends keyof T>(event?: K | null, handler?: Handler<T[K]> | null) => void;
    clear: () => void;
    emit: <K extends keyof T>(event: K, data?: T[K]) => void;
}

/**
 * React hook for component-scoped event management with automatic cleanup.
 *
 * This hook provides a clean API for event handling that automatically manages
 * event listener cleanup when the component unmounts. It's designed for the
 * common React pattern where event listeners are registered in useEffect with
 * empty dependencies and cleaned up on component unmount.
 *
 * Key features:
 * - Automatic cleanup on component unmount
 * - Support for anonymous functions as event handlers
 * - Flexible removal options (all events, specific event, specific handler)
 * - Duplicate registration prevention
 * - Full TypeScript support with type-safe events
 *
 * @template T - Event map type for type-safe event handling
 * @returns {UseEveReturn<T>} Event management functions
 */
const useEve = <T extends EventMap = EventMap>(): UseEveReturn<T> => {
    // Track all handlers registered by this component instance
    const handlerRef = useRef<HandlerEntry<T>[]>([]);

    /**
     * Register an event listener
     *
     * @template T - Event map type for type-safe event handling
     * @template K - Specific event key type
     *
     * @param {K} event - Event name to listen for
     * @param {Handler<T[K]>} handler - Function to call when event is emitted
     */
    const on = useCallback(<K extends keyof T>(event: K, handler: Handler<T[K]>) => {
        // Prevent duplicate registrations
        if (handlerRef.current.find(({ event: e, handler: h }) => e === event && h === handler)) {
            return;
        }

        emitter.on(event, handler);
        handlerRef.current.push({ event, handler });
    }, []);

    /**
     * Remove event listeners with flexible filtering options
     *
     * @template T - Event map type for type-safe event handling
     * @template K - Specific event key type
     *
     * @param {K | null} [event=null] - Event name to filter by (null = all events)
     * @param {Handler<T[K]> | null} [handler=null] - Handler function to filter by (null = all handlers)
     *
     * Usage examples:
     * - off() - Remove all listeners registered by this component
     * - off('user-login') - Remove all listeners for 'user-login' event
     * - off('user-login', handleLogin) - Remove specific handler for specific event
     * - off(null, handleLogin) - Remove specific handler from all events
     */
    const off = useCallback(<K extends keyof T>(event: K | null = null, handler: Handler<T[K]> | null = null) => {
        const deleteIndex: number[] = [];

        // Find all handlers that match the filter criteria
        handlerRef.current.forEach(({ event: e, handler: h }, i) => {
            if ((!event || event === e) && (!handler || handler === h)) {
                emitter.off(e, h);
                deleteIndex.push(i);
            }
        });

        // Remove from tracking array (reverse order to maintain indices)
        deleteIndex.sort().reverse().forEach(i => handlerRef.current.splice(i, 1));
    }, []);

    /**
     * Remove all event listeners registered by this component
     * Alias for off() with no parameters
     */
    const clear = useCallback((): void => {
        handlerRef.current.forEach(({ event, handler }) => emitter.off(event, handler));
        handlerRef.current = [];
    }, []);

    /**
     * Emit an event with optional data
     *
     * @template T - Event map type for type-safe event handling
     * @template K - Specific event key type
     *
     * @param {K} event - Event name to emit
     * @param {T[K]} [data] - Optional data to pass to event handlers
     */
    const emit = useCallback(<K extends keyof T>(event: K, data?: T[K]): void => {
        emitter.emit(event, data);
    }, []);

    // Automatic cleanup on component unmount
    useEffect(() => {
        return () => {
            handlerRef.current.forEach(({ event, handler }) => {
                try {
                    emitter.off(event, handler);
                } catch {
                    // Ignore cleanup errors (handler might already be removed)
                }
            });
        };
    }, []);

    return { on, off, clear, emit };
};

export default useEve;

/**
 * Simple hook for event listening without component-scoped cleanup
 *
 * This hook directly registers/unregisters events and is suitable for
 * cases where you want direct control over the event lifecycle.
 *
 * @template T - Event map type for type-safe event handling
 * @template K - Specific event key type
 *
 * @param {K} event - Event name to listen for
 * @param {Handler<T[K]> | undefined} handler - Function to call when event is emitted
 */
export const useEveListen = <T extends EventMap = EventMap, K extends keyof T = keyof T>(
    event: K,
    handler: Handler<T[K]> | undefined
): void => {
    useEffect(() => {
        if (handler) {
            emitter.on(event, handler);
            return () => emitter.off(event, handler);
        }
    }, [event, handler]);
};

/**
 * Global function to emit events from anywhere in the application
 *
 * @template T - Event map type for type-safe event handling
 * @template K - Specific event key type
 *
 * @param {K} event - Event name to emit
 * @param {T[K]} [data] - Optional data to pass to event handlers
 */
export const eve = <T extends EventMap = EventMap, K extends keyof T = keyof T>(
    event: K,
    data?: T[K]
): void => emitter.emit(event, data);

// Export types for external use
export type { EventMap, HandlerEntry, UseEveReturn };

