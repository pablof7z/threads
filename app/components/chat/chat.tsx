import React, { useCallback, useMemo } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { KeyboardAvoidingView, KeyboardStickyView, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, { clamp, interpolate, SharedValue, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, Platform, View, ViewStyle } from 'react-native';
import { NDKEvent, NDKEventId } from '@nostr-dev-kit/ndk';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import { router, Stack } from 'expo-router';
import ChatBubble from './ChatBubble';
import Composer from './Composer';
import { MockMessage } from '@/app/messages/thread';
import { DateSeparator } from '../ChatComponents';

const HEADER_HEIGHT = Platform.select({ ios: 88, default: 64 });
const dimensions = Dimensions.get('window');
const ROOT_STYLE: ViewStyle = { flex: 1, minHeight: 2 };
const SPRING_CONFIG = { damping: 15, stiffness: 150, mass: 0.5, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 };

interface ChatIosProps {
    events: NDKEvent[];
    messages: MockMessage[];
    replies: Map<NDKEventId, NDKEvent[]>;
}

const ChatIos: React.FC<ChatIosProps> = ({ events, messages, replies }) => {
    const { colors, isDarkColorScheme } = useColorScheme();
    const insets = useSafeAreaInsets();
    const { progress } = useReanimatedKeyboardAnimation();
    const textInputHeight = useSharedValue(17);
    const translateX = useSharedValue(0);
    const previousTranslateX = useSharedValue(0);
    const initialTouchLocation = useSharedValue<{ x: number; y: number } | null>(null);

    const toolbarHeightStyle = useAnimatedStyle(() => ({
        height: interpolate(progress.value, [0, 1], [52 + insets.bottom, insets.bottom + textInputHeight.value - 2]),
    }));

    const pan = Gesture.Pan()
        .minDistance(10)
        .onBegin((evt) => { initialTouchLocation.value = { x: evt.x, y: evt.y }; })
        .onStart(() => { previousTranslateX.value = translateX.value; })
        .onTouchesMove((evt, state) => {
            if (!initialTouchLocation.value || !evt.changedTouches.length) {
                state.fail();
                return;
            }
            const xDiff = evt.changedTouches[0].x - initialTouchLocation.value.x;
            const yDiff = Math.abs(evt.changedTouches[0].y - initialTouchLocation.value.y);
            const isHorizontalPanning = Math.abs(xDiff) > yDiff;
            if (isHorizontalPanning && xDiff < 0) {
                state.activate();
            } else {
                state.fail();
            }
        })
        .onUpdate((event) => { translateX.value = clamp(event.translationX / 2 + previousTranslateX.value, -75, 0); })
        .onEnd((event) => {
            const right = event.translationX > 0 && translateX.value > 0;
            const left = event.translationX < 0 && translateX.value < 0;
            if (right) {
                if (translateX.value > dimensions.width / 2) {
                    translateX.value = withSpring(dimensions.width, SPRING_CONFIG);
                    return;
                }
                translateX.value = withSpring(0, SPRING_CONFIG);
                return;
            }
            if (left) {
                if (translateX.value < -dimensions.width / 2) {
                    translateX.value = withSpring(-dimensions.width, SPRING_CONFIG);
                    return;
                }
                translateX.value = withSpring(0, SPRING_CONFIG);
                return;
            }
            translateX.value = withSpring(0, SPRING_CONFIG);
        });

    return (
        <>
            <GestureDetector gesture={pan}>
                <KeyboardAvoidingView
                    style={[
                        ROOT_STYLE,
                        { flex: 1, backgroundColor: isDarkColorScheme ? colors.background : colors.card },
                    ]}
                    behavior="padding"
                >
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
                            const isSameNextSender = typeof nextMessage !== 'string' ? nextMessage?.sender === item.sender : false;
                            return (
                                <ChatBubble
                                    isSameNextSender={isSameNextSender}
                                    item={item}
                                    replies={replies.get(item.id)}
                                    translateX={translateX}
                                />
                            );
                        }}
                    />
                </KeyboardAvoidingView>
            </GestureDetector>
            <KeyboardStickyView offset={{ opened: insets.bottom }}>
                <Composer textInputHeight={textInputHeight} setMessages={() => {}} />
            </KeyboardStickyView>
        </>
    );
};

export default ChatIos;