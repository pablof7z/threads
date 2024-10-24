import {
    NDKEvent,
    NDKFilter,
    NDKRelaySet,
    NDKSubscription,
    NDKSubscriptionOptions,
} from '@nostr-dev-kit/ndk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNDK } from './ndk';

export const useSubscribe = ({
    filters,
    opts = undefined,
    relays = undefined,
}: UseSubscribeParams) => {
    const [events, setEvents] = useState<NDKEvent[]>([]);
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
        (event: NDKEvent) => {
            if (eventIds.current.has(event.id)) return;

            setEvents((prevEvents) => {
                eventIds.current.add(event.id);

                if (opts?.klass) {
                    event = opts.klass.from(event);
                }
                
                return [...prevEvents, event];
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
