import React, { useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSubscribe } from '@/ndk-expo';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { useColorScheme } from '~/lib/useColorScheme';
import ChatIos from '../components/chat/chat';

export default function GroupChat() {
    const { groupId } = useLocalSearchParams();
    const { colors, isDarkColorScheme } = useColorScheme();

    const filters = useMemo(() => [
        { kinds: [NDKKind.GroupChat, NDKKind.GroupReply], "#h": [groupId] }
    ], [groupId]);

    const { events } = useSubscribe({ filters });

    const mapEventToChatBubble = useCallback((e: NDKEvent) => ({
        id: e.id,
        sender: e.pubkey,
        text: e.content,
        timestamp: e.created_at,
        event: e,
        reactions: {},
        attachments: [],
        date: new Date(e.created_at! * 1000).toLocaleDateString(),
        time: new Date(e.created_at! * 1000).toLocaleTimeString(),
    }), []);

    const { messages, replies } = useMemo(() => {
        const eventMap = new Map<string, NDKEvent>();
        const replyMap = new Map<string, NDKEvent[]>();

        for (const event of events) {
            if (eventMap.has(event.id)) continue;

            const replyTag = event.tags.find(tag => tag[0] === 'e');
            if (!replyTag || replyTag[1] === groupId) {
                eventMap.set(event.id, event);
            } else {
                replyMap.set(replyTag[1], [...(replyMap.get(replyTag[1]) || []), event]);
            }
        }

        return {
            messages: Array.from(eventMap.values())
                .sort((a, b) => b.created_at! - a.created_at!)
                .map(mapEventToChatBubble),
            replies: replyMap
        };
    }, [events]);

    return (
        <View style={{ flex: 1, backgroundColor: isDarkColorScheme ? colors.background : colors.card }}>
            <ChatIos events={events} messages={messages} replies={replies} />
        </View>
    );
}
