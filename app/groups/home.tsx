import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { router, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { NDKSimpleGroupMetadata, NDKKind, NDKSimpleGroupMemberList } from '@nostr-dev-kit/ndk';
import { useSubscribe } from '@/ndk-expo';
import AvatarGroup from '@/ndk-expo/components/user/AvatarGroup';
import { ScrollView } from 'react-native-gesture-handler';
import { SegmentedControl } from '~/components/nativewindui/SegmentedControl';
import { Button } from '@/components/nativewindui/Button';

const GROUP_EVENT_KINDS = [9, 10, 11, 12, 30023];

const Home: React.FC = () => {
    const { groupId } = useLocalSearchParams();

    const filters = useMemo(() => [
        { kinds: [NDKKind.GroupMetadata, NDKKind.GroupMembers - 1, NDKKind.GroupMembers], "#d": [groupId] },
        { kinds: GROUP_EVENT_KINDS, "#h": [groupId] },
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

    const [selectedIndex, setSelectedIndex] = useState(0);
    
    const sections = useMemo(() => {
        const sections = new Set<string>();
        sections.add("Group");

        for (const event of groupEvents) {
            switch (event.kind!) {
                case NDKKind.GroupChat:
                    sections.add('Chat');
                    break;
                case NDKKind.Article:
                    sections.add('Reads');
                    break;
            }
        }

        return Array.from(sections);
    }, [ groupEvents ]);

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

                    <SegmentedControl
                        values={sections}
                        selectedIndex={0}
                        onIndexChange={(index) => {
                            setSelectedIndex(index);
                            if (sections[index] === 'Chat') {
                                router.push(`/groups/chat?groupId=${groupId}`);
                            }
                        }}
                    />
                    
                <Text style={styles.name}>{metadata.name}</Text>
                {admins && (
                    <AvatarGroup pubkeys={admins.members} avatarSize={8} threshold={5} />
                    )}
                </View>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: 200,
    },
    name: {
        marginTop: 220,
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default Home;
