import { router } from 'expo-router';
import * as React from 'react';
import { renderItem } from '@/components/lists/items';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { NDKEvent, NDKSimpleGroupMetadata, NDKEventId } from '@nostr-dev-kit/ndk';
import { Thread } from '@/components/lists/items/thread';
import { useGroupMetadata } from './hooks/useGroups';
import { useThreads } from './hooks/useThreads';
import { FlashList } from '@shopify/flash-list';
import GroupCard from './components/groups/card';
import { List } from '@/components/nativewindui/List';
import { Dimensions, View } from 'react-native';
import { Text } from '@/components/nativewindui/Text';
import { ScrollView } from 'react-native-gesture-handler';

export default function ConversationsIosScreen() {
    const groupItems = useGroupMetadata();
    const threads = useThreads();
    // const lists = useLists();

    const handleGroupPress = (group: NDKSimpleGroupMetadata) => {
        const groupId = group.dTag;
        router.push(`/groups/view?groupId=${groupId}`);
    };

    const handleMessagePress = (thread: Thread) => {
        console.log('clicked ', thread);
        router.push(`/messages/thread?eventId=${thread.rootEventId}`);
    };

    const renderItemFn = renderItem(handleMessagePress, handleGroupPress);

    const listItems = useMemo(() => [...threads, ...groupItems], [threads, groupItems]);

    const featuredGroups = useMemo(() => groupItems
        .filter((group) => group.name && group.picture)
        .slice(0, 10)
    , [groupItems]);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView 
                horizontal={true} // Enable horizontal scrolling
                stickyHeaderHiddenOnScroll
                showsHorizontalScrollIndicator={false}
                style={{ height: 320, flexGrow: 0 }}
            >
                {featuredGroups.map((item, index) => (
                    <View style={{ paddingHorizontal: 5, paddingVertical: 10 }}>
                        <GroupCard groupMetadata={item} />
                    </View>
                ))}
            </ScrollView>
            <List
                data={listItems}
                contentInsetAdjustmentBehavior="automatic"
                estimatedItemSize={88}
                keyExtractor={(item: Thread | NDKSimpleGroupMetadata) => item.id}
                renderItem={renderItemFn}
            />
        </View>
    );
}
