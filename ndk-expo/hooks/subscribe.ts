import { createStore } from 'zustand/vanilla';
import {
    NDKEvent,
    NDKFilter,
    NDKRelaySet,
    NDKSubscription,
    NDKSubscriptionOptions,
} from '@nostr-dev-kit/ndk';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNDK } from './ndk';
import { useStore } from 'zustand';
import { useIsFocused } from '@react-navigation/native';

type NDKEventWithFrom<T> = NDKEvent & { from: (event: T) => T };

interface UseSubscribeParams {
    filters: NDKFilter[] | null;
    opts?: NDKSubscriptionOptions & {
        klass?: NDKEventWithFrom<any>
        includeDeleted?: boolean
    };
    relays?: string[];
}

interface SubscribeStore<T> {
    events: T[];
    eose: boolean;
    isSubscribed: boolean;
    addEvent: (event: T) => void;
    setEose: () => void;
    clearEvents: () => void;
    setSubscription: (sub: NDKSubscription | undefined) => void;
    subscriptionRef: NDKSubscription | undefined;
}

const createSubscribeStore = <T extends NDKEvent>() =>
    createStore<SubscribeStore<T>>((set) => ({
        events: [],
        eose: false,
        isSubscribed: false,
        subscriptionRef: undefined,
        addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
        setEose: () => set({ eose: true }),
        clearEvents: () => set({ events: [], eose: false }),
        setSubscription: (sub) => set({ subscriptionRef: sub, isSubscribed: !!sub }),
    }));

export const useSubscribe = <T extends NDKEvent>({
    filters,
    opts = undefined,
    relays = undefined,
}: UseSubscribeParams) => {
    const { ndk } = useNDK();
    const store = useMemo(() => createSubscribeStore<T>(), []);
    const storeInstance = useStore(store);
    const eventIds = useRef<Set<string>>(new Set());

    const relaySet = useMemo(() => {
        if (ndk && relays && relays.length > 0) {
            return NDKRelaySet.fromRelayUrls(relays, ndk);
        }
        return undefined;
    }, [ndk, relays]);

    const handleEvent = useCallback((event: NDKEvent) => {
        const id = event.tagId();
        if (eventIds.current.has(id)) return;

        console.log('received event', event.kind, event.id.substring(0, 6))

        if (opts?.includeDeleted !== true && event.isParamReplaceable() && event.hasTag('deleted')) {
            eventIds.current.add(id);
            return;
        }

        if (opts?.klass) {
            event = opts.klass.from(event);
        }

        if (!event) return;

        storeInstance.addEvent(event as T);
        eventIds.current.add(id);
    }, [opts?.klass]);

    const handleEose = () => {
        storeInstance.setEose();
    };

    const handleClosed = () => {
        storeInstance.setSubscription(undefined);
    };

    const focused = useIsFocused();

    useEffect(() => {
        console.log('subscription focused changed', {focused})
    }, [focused]);

    useEffect(() => {
        if (!filters || filters.length === 0 || !ndk) return;

        if (storeInstance.subscriptionRef) {
            storeInstance.subscriptionRef.stop();
            storeInstance.setSubscription(undefined);
        }

        console.log("creating subscription for filters", filters)
        
        const subscription = ndk.subscribe(filters, opts, relaySet, false);
        subscription.on('event', handleEvent);
        subscription.on('eose', handleEose);
        subscription.on('closed', handleClosed);

        storeInstance.setSubscription(subscription);
        subscription.start();

        return () => {
            if (storeInstance.subscriptionRef) {
                storeInstance.subscriptionRef.stop();
                storeInstance.setSubscription(undefined);
            }
            eventIds.current.clear();
            storeInstance.clearEvents();
        };
    }, [filters, opts, relaySet, ndk]);

    return { events: storeInstance.events, eose: storeInstance.eose, isSubscribed: storeInstance.isSubscribed };
};
