import {
    NDKEvent,
    NDKFilter,
    NDKRelaySet,
    NDKSubscription,
    NDKSubscriptionOptions,
} from '@nostr-dev-kit/ndk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNDK } from './ndk';

type NDKEventWithFrom<T> = NDKEvent & { from: (event: T) => Promise<T> };

interface UseSubscribeParams {
    filters: NDKFilter[] | null;
    opts?: NDKSubscriptionOptions & { klass?: NDKEventWithFrom<any> };
    relays?: string[];
}

export const useSubscribe = <T = NDKEvent>({
    filters,
    opts = undefined,
    relays = undefined,
}: UseSubscribeParams) => {
    const [events, setEvents] = useState<T[]>([]);
    const [eose, setEose] = useState(false);
    const { ndk } = useNDK();
    const subscriptionRef = useRef<NDKSubscription | undefined>();
    const eventIds = useRef<Set<string>>(new Set());

    const relaySet = useMemo(() => {
        if (ndk && relays && relays.length > 0) {
            return NDKRelaySet.fromRelayUrls(relays, ndk);
        }
        return undefined;
    }, [ndk, relays]);

    const handleEvent = useCallback(
        async (event: NDKEvent) => {
            if (eventIds.current.has(event.id)) return;
            const e = event;
            if (opts?.klass) {
                event = await opts.klass.from(event);
            }

            if (!event) {
                console.warn(`No event on subscription: ${e.id}`);
                console.log(e.rawEvent());
                return;
            }

            setEvents((prevEvents) => {
                eventIds.current.add(event.id);
                return [...prevEvents, event as T]
                    .sort((a, b) => (b as NDKEvent).created_at! - (a as NDKEvent).created_at!);
            });
        },
        []
    );

    const handleEose = useCallback(() => {
        setEose(true);
    }, []);

    const handleClosed = useCallback(() => {
        subscriptionRef.current = undefined;
    }, []);

    useEffect(() => {
        if (!filters || filters.length === 0 || !ndk) return;

        // Avoid unnecessary re-subscriptions
        if (subscriptionRef.current) {
            subscriptionRef.current.stop();
            subscriptionRef.current = undefined;
        }

        const subscription = ndk.subscribe(filters, opts, relaySet, false);
        subscription.on('event', handleEvent);
        subscription.on('eose', handleEose);
        subscription.on('closed', handleClosed);

        subscriptionRef.current = subscription;
        subscription.start();

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.stop();
                subscriptionRef.current = undefined;
            }
            eventIds.current.clear();
        };
    }, [filters, opts, relaySet, ndk, handleEvent, handleEose, handleClosed]);

    return { events, eose, isSubscribed: !!subscriptionRef.current };
};
