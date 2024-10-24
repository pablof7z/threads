import { useMemo } from 'react';
import { useSubscribe } from '@/ndk-expo';
import { NDKKind, NDKList, NDKSimpleGroupMetadata, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
import { myFollows } from '../myfollows';

export const useLists = () => {
    // first grab people I interact with by grabbing my kind:1s
    const myNotesFilter = useMemo(() => ({ kinds: [1], authors: ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"] }), []);
    const myNotesOpts = useMemo(() => ({ closeOnEose: true }), []);
    const { events: myNotes } = useSubscribe({ filters: myNotesFilter, opts: myNotesOpts });

    // create a set of pubkeys with which I interact the most by counting how many times their pubkey appears in a p tag of an event in myNotes
    const myPTags = useMemo(() => {
        const pTags = new Map<string, number>();
        for (const note of myNotes) {
            for (const tag of note.tags) {
                if (tag[0] === 'p') pTags.set(tag[1], (pTags.get(tag[1]) ?? 0) + 1);
            }
        }
        console.log('pTags', pTags);
        return Array.from(pTags.entries()).sort((a, b) => b[1] - a[1]).map(([p]) => p).slice(0, 10);
    }, [myNotes]);

    const listsFilter = useMemo(() => {
        if (myPTags.length === 0) return null;
        return { kinds: [NDKKind.CategorizedPeopleList], authors: myPTags };
    }, [myPTags]);

    const listsOpts = useMemo(() => ({
        cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
        klass: NDKList,
    }), []);

    console.log('listsFilter', listsFilter);
    
    const { events: lists } = useSubscribe({
        filters: listsFilter,
        opts: listsOpts,
    });

    return listsFilter ? lists : [];
};
