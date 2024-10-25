import React, { useMemo, useCallback } from 'react';
import { View, Dimensions, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSubscribe } from '@/ndk-expo';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '~/lib/useColorScheme';
import { ChatBubble, DateSeparator } from '../components/ChatComponents';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';

const dimensions = Dimensions.get('window');
const HEADER_HEIGHT = Platform.select({ ios: 88, default: 64 });

const GroupChat: React.FC = () => {
    const { groupId } = useLocalSearchParams();
    const { colors, isDarkColorScheme } = useColorScheme();
    const insets = useSafeAreaInsets();
    const { progress } = useReanimatedKeyboardAnimation();

    const filters = useMemo(() => [
        { kinds: [NDKKind.GroupChat, NDKKind.Article], "#d": [groupId] }
    ], [groupId]);

    const { events } = useSubscribe({ filters });

    const toolbarHeightStyle = useAnimatedStyle(() => {
        return {
            height: interpolate(
                progress.value,
                [0, 1],
                [52 + insets.bottom, insets.bottom + 17 - 2]
            ),
        };
    });

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

    const messages = useMemo(() => {
        return events
            .filter(event => [NDKKind.GroupChat, NDKKind.Article].includes(event.kind!))
            .map(mapEventToChatBubble)
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [events]);

    return (
        <>
            <Stack.Screen options={{ title: 'Group Chat' }} />
            <View style={{ flex: 1, backgroundColor: isDarkColorScheme ? colors.background : colors.card }}>
                <FlashList
                    inverted
                    estimatedItemSize={70}
                    ListFooterComponent={<View style={{ height: HEADER_HEIGHT + insets.top }} />}
                    ListHeaderComponent={<Animated.View style={toolbarHeightStyle} />}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    scrollIndicatorInsets={{ bottom: HEADER_HEIGHT + 10, top: insets.bottom + 2 }}
                    data={messages}
                    renderItem={({ item, index }) => {
                        if (typeof item === 'string') {
                            return <DateSeparator date={item} />;
                        }

                        const nextMessage = messages[index - 1];
                        const isSameNextSender =
                            typeof nextMessage !== 'string' ? nextMessage?.sender === item.sender : false;

                        return (
                            <ChatBubble
                                isSameNextSender={isSameNextSender}
                                item={item}
                                translateX={useSharedValue(0)}
                            />
                        );
                    }}
                />
            </View>
        </>
    );
};

export default GroupChat;
