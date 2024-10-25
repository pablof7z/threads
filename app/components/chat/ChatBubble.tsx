import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { MockMessage } from '@/app/messages/thread';
import * as User from '@/ndk-expo/components/user';
import EventContent from '@/ndk-expo/components/event/content';
import RelativeTime from '../relative-time';

interface ChatBubbleProps {
    item: MockMessage;
    isSameNextSender: boolean;
    replies?: NDKEvent[];
    translateX: SharedValue<number>;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ item, isSameNextSender, replies, translateX }) => {
    const animatedStyle = {
        transform: [{ translateX: translateX.value }],
    };

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <User.Profile pubkey={item.sender}>
                <View style={styles.bubble}>
                    <Text style={styles.message}>
                        <EventContent event={item.event} />
                    </Text>
                </View>

                <View style={styles.footer}>
                    <User.Name />

                    <Text style={styles.time} className="text-muted-foreground">
                        <RelativeTime timestamp={item.event.created_at!} />
                    </Text>
                </View>

            </User.Profile>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        paddingHorizontal: 10,
    },
    bubble: {
        backgroundColor: '#e1f5fe',
        borderRadius: 8,
        padding: 10,
    },
    sender: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    message: {
        fontSize: 16,
    },
    replies: {
        marginTop: 8,
        paddingLeft: 10,
        borderLeftWidth: 2,
        borderLeftColor: '#b3e5fc',
    },
    reply: {
        fontSize: 14,
        color: '#00796b',
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default ChatBubble;
