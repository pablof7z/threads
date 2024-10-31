import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { router, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { NDKSimpleGroupMetadata, NDKKind, NDKSimpleGroupMemberList, NDKArticle } from '@nostr-dev-kit/ndk';
import { useSubscribe } from '@/ndk-expo';
import AvatarGroup from '@/ndk-expo/components/user/AvatarGroup';
import { ScrollView } from 'react-native-gesture-handler';
import { List } from '@/components/nativewindui/List';
import { renderItem } from '@/components/lists/items';
import { articleStore } from '../stores';
import { useStore } from 'zustand';

const GROUP_EVENT_KINDS = [9, 10, 11, 12, 30023];

const Home: React.FC = () => {
    const { groupId } = useLocalSearchParams();

    const filters = useMemo(() => [
        { kinds: [NDKKind.GroupMetadata, NDKKind.GroupMembers - 1, NDKKind.GroupMembers], "#d": [groupId! as string] },
        { kinds: GROUP_EVENT_KINDS, "#h": [groupId! as string] },
    ], [groupId]);
    const { events: groupEvents } = useSubscribe({ filters });

    const metadata = useMemo(() => {
        const event = groupEvents.find((event) => event.kind === NDKKind.GroupMetadata);
        return event ? NDKSimpleGroupMetadata.from(event) : undefined;
    }, [groupEvents]);
    const admins = useMemo(() => {
        const event = groupEvents.find((event) => event.kind === NDKKind.GroupMembers - 1);
        return event ? NDKSimpleGroupMemberList.from(event) : undefined;
    }, [groupEvents]);
    const members = useMemo(() => {
        const event = groupEvents.find((event) => event.kind === NDKKind.GroupMembers);
        return event ? NDKSimpleGroupMemberList.from(event) : undefined;
    }, [groupEvents]);
    const events = useMemo(() => groupEvents.filter((event) => GROUP_EVENT_KINDS.includes(event.kind!)), [groupEvents]);

    const articles = groupEvents.filter(e => e.kind === NDKKind.Article).map(NDKArticle.from)

    const store = useStore(articleStore);

    if (!metadata) {
        return <Text>Loading...</Text>;
    }

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: metadata.name ?? 'Group',
                }} 
            />
            <ScrollView>
                <View style={styles.container}>
                    <Image source={{ uri: metadata.picture ?? "https://m.primal.net/KwlG.jpg" }} style={styles.image} />
                    
                    <Text style={styles.name}>{metadata.name}</Text>
                    {admins && (
                        <AvatarGroup pubkeys={admins.members} avatarSize={8} threshold={5} />
                    )}
                </View>

                <List
                    // data={listItems}
                    data={articles}
                    contentInsetAdjustmentBehavior="automatic"
                    estimatedItemSize={88}
                    keyExtractor={(item: NDKArticle) => item.id}
                    renderItem={renderItem({
                        onArticlePress: (article: NDKArticle) => {
                            store.setArticle(article)
                            router.push(`/article`);
                        }
                    })}
                />
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: 200,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default Home;
