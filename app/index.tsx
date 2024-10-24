import { Icon } from '@roninoss/icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import GroupCard from './components/groups/card';
import { Image } from 'expo-image';
import { myFollows } from './myfollows';
import * as React from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import * as User from '@/ndk-expo/components/user';
import {
    type TextStyle,
    type ViewStyle,
    Platform,
    Pressable,
    View,
    Dimensions,
} from 'react-native';
import { ThreadItem, GroupItem, renderItem, ListItem } from '@/components/lists/items';

import { List } from '~/components/nativewindui/List';
import { useNDK, useSubscribe } from '@/ndk-expo';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { NDKEvent, NDKSubscriptionCacheUsage, getRootEventId, NDKKind, NDKSimpleGroupMetadata, NDKEventId } from '@nostr-dev-kit/ndk';
import { Thread } from '@/components/lists/items/thread';

export default function ConversationsIosScreen() {
    const processedRootEventIds = useRef<Set<string>>(new Set());
    const { ndk } = useNDK();

    const handleGroupPress = (group: NDKSimpleGroupMetadata) => {
        const groupId = group.dTag;
        router.push(`/groups/view?groupId=${groupId}`);
    };

    const handleMessagePress = (thread: Thread) => {
      console.log('clicked ', thread)
        router.push(`/messages/thread?eventId=${thread.rootEventId}`);
    };

    const renderItemFn = renderItem(handleMessagePress, handleGroupPress);

    const groupMetadataFilter = useMemo(() => ({ kinds: [NDKKind.GroupMetadata] }), []);
    const groupMetadataOpts = useMemo(() => ({
        cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
        klass: NDKSimpleGroupMetadata,
        relays: ['wss://groups.fiatjaf.com', 'wss://relay.0xchat.com'],
    }), []);
    const { events: groupMetadata } = useSubscribe({ filters: groupMetadataFilter, opts: groupMetadataOpts });

    const filter = useMemo(() => ([{ kinds: [1], "#p": ["fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"], limit: 10 }]), []);
    const opts = useMemo(() => ({
        cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
    }), []);
    const { events, eose } = useSubscribe({ filters: filter, opts });

    const rootEventIdOrEventId = (event: NDKEvent) => getRootEventId(event) ?? event.id;

    const rootEventIds = useMemo(() => new Set(events.map(rootEventIdOrEventId)), [events]);

    const [threads, setThreads] = useState<Thread[]>([]);

    const groupItems = useMemo(() => {
        const uniqueGroups = new Set<string>();
        return groupMetadata
            .filter((g) => {
                if (uniqueGroups.has(g.id)) {
                    return false;
                }
                uniqueGroups.add(g.id);
                return true;
            })
    }, [groupMetadata]);


    const handleEvent = (rootEventId: NDKEventId) => (event: NDKEvent) => {
        setThreads((prev) => {
            const thread = prev.find((t) => t.rootEventId === rootEventId);
            if (thread) {
                thread.events.push(event);
                return [...prev];
            } else {
                return [...prev, { id: rootEventId, rootEventId, events: [event] }];
            }
        });
    }

    const listItems = useMemo(() => [...threads, ...groupItems], [threads, groupItems]);

    useEffect(() => {
        if (!ndk) return;
        
        for (const rootEventId of rootEventIds) {
            if (processedRootEventIds.current.has(rootEventId)) continue;

            processedRootEventIds.current.add(rootEventId);
            const sub = ndk.subscribe(
                [ { kinds: [1], ids: [rootEventId] }, { kinds: [1], "#e": [rootEventId] } ],
                { closeOnEose: false },
                undefined, false
            );
            sub.on('event', handleEvent(rootEventId));
            sub.on('eose', () => {
                console.log('eose', rootEventId);
            });
            sub.start();
        }
    }, [ndk, rootEventIds]);

  return (
    <View style={{ flex: 1, minHeight: 400 }}>
        {/* <FlashList
            horizontal
            stickyHeaderHiddenOnScroll
            showsHorizontalScrollIndicator={false}
            estimatedItemSize={400}
            data={groupItems.filter((item) => item.groupMetadata.picture)}
            keyExtractor={(item, index) => {
                console.log('key extractor', item.id, index);
                return item.id
            }}
            renderItem={(info) => (
                <GroupCard groupMetadata={info.item.groupMetadata} />
            )}
        /> */}
        
        <List
            data={[{id: "notifications"}, ...listItems]}
            contentInsetAdjustmentBehavior="automatic"
            estimatedItemSize={88}
            keyExtractor={(item: ListItem) => item.id}
            renderItem={renderItemFn}
        />
    </View>
  );
}
