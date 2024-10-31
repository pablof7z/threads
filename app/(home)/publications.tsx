import { router } from 'expo-router';
import * as React from 'react';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { NDKEvent, NDKSimpleGroupMetadata, NDKEventId, NDKKind, NDKArticle } from '@nostr-dev-kit/ndk';
import { Thread } from '@/components/lists/items/thread';
import { useGroupMetadata } from '../hooks/useGroups';
import { useThreads } from '../hooks/useThreads';
import GroupCard from '../components/groups/card';
import { List } from '@/components/nativewindui/List';
import { Dimensions, GestureResponderEvent, SafeAreaView, StyleSheet, Touchable, View } from 'react-native';
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
import { Text } from '@/components/nativewindui/Text';
import { Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as User from '@/ndk-expo/components/user';
import { renderItem } from '@/components/lists/items';
import { withPayload } from '@/ndk-expo/providers/ndk/signers';
import { useNDK, useSubscribe } from '@/ndk-expo';
import { useNDKSession } from '@/ndk-expo/hooks/session';
import { LargeTitleHeader } from '@/components/nativewindui/LargeTitleHeader';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import Swipeable from '@/components/ui/Swipable';
import Article from '@/components/events/article';
import { articleStore } from '../stores';
import { useStore } from 'zustand';
import { LinearGradient } from 'expo-linear-gradient';
import { Toolbar, ToolbarCTA, ToolbarIcon } from '@/components/nativewindui/Toolbar';
import GroupRow from '@/components/lists/items/group';
import { useDebounce } from '@uidotdev/usehooks';

export default function PublicationsScreen() {
    const groups = useGroupMetadata();
    // const threads = useThreads();
    // const lists = useLists();

    const handleGroupPress = (group: NDKSimpleGroupMetadata) => {
        const groupId = group.dTag;
        router.push(`/groups?groupId=${groupId}`);
    };

    const renderItemFn = renderItem({
        onGroupPress: handleGroupPress
    });

    const featuredGroups = useMemo(() => groups
        .filter((group) => group.name && group.picture)
        .slice(0, 10)
    , [groups]);

    const [groupsWithArticles, setGroupsWithArticles] = useState()

    const debouncedGroups = useDebounce(groups, 50);

    return (
        <View className="flex-1 items-stretch justify-stretch">
            <List
                data={debouncedGroups}
                contentInsetAdjustmentBehavior="automatic"
                estimatedItemSize={88}
                keyExtractor={(item: NDKSimpleGroupMetadata) => item.id}
                renderItem={renderItemFn}
            />
        </View>
    );
}
