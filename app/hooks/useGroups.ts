import { useMemo } from 'react';
import { useSubscribe } from '@/ndk-expo';
import { NDKKind, NDKSimpleGroupMetadata, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';

export const useGroupMetadata = () => {
    const groupMetadataFilter = useMemo(() => ({ kinds: [NDKKind.GroupMetadata] }), []);
    const groupMetadataOpts = useMemo(() => ({
        klass: NDKSimpleGroupMetadata,
    }), []);
    const relays = useMemo(() => ['wss://groups.fiatjaf.com', 'wss://relay.0xchat.com', 'ws://localhost:2929'], []);
    const { events: groupMetadata } = useSubscribe({ filters: groupMetadataFilter, opts: groupMetadataOpts, relays });
    
    return useMemo(() => {
        const uniqueGroups = new Set<string>();
        return groupMetadata.filter((g: NDKSimpleGroupMetadata) => {
            if (!g.name) return false;
            if (uniqueGroups.has(g.id)) {
                return false;
            }
            uniqueGroups.add(g.id);
            return true;
        }) as NDKSimpleGroupMetadata[];
    }, [groupMetadata]);
};
