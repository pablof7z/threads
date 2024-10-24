import { Icon } from '@roninoss/icons';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import * as User from '@/ndk-expo/components/user';
import {
  Dimensions,
  Image,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  TextInput,
  TextInputContentSizeChangeEventData,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector, Swipeable } from 'react-native-gesture-handler';
import {
  KeyboardAvoidingView,
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller';
import Animated, {
  clamp,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, AvatarFallback } from '~/components/nativewindui/Avatar';
import { Button } from '~/components/nativewindui/Button';
import { ContextMenu } from '~/components/nativewindui/ContextMenu';
import { ContextMenuRef } from '~/components/nativewindui/ContextMenu/types';
import { createContextItem } from '~/components/nativewindui/ContextMenu/utils';
import { Text } from '~/components/nativewindui/Text';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';
import { useSubscribe } from '@/ndk-expo';
import { useCallback, useMemo, useState } from 'react';
import { getReplyTag, getRootTag, NDKEvent, NDKEventId } from '@nostr-dev-kit/ndk';
import EventContent from '@/ndk-expo/components/event/content';
import AvatarGroup from '../components/AvatarGroup';

const ME = 'Alice';

const HEADER_HEIGHT = Platform.select({ ios: 88, default: 64 });

const dimensions = Dimensions.get('window');

const ROOT_STYLE: ViewStyle = {
  flex: 1,
  minHeight: 2,
};

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

const SCREEN_OPTIONS = { header };

// Note: For few messages to start at top, use a FlatList instead of the FlashList
// Add `contentContainerStyle={{ justifyContent: 'flex-end', flexGrow: 1 }}` to the FlatList (it is not possible with FlashList atm)

export default function ChatIos() {
    const { colors, isDarkColorScheme } = useColorScheme();
    const insets = useSafeAreaInsets();
    const { progress } = useReanimatedKeyboardAnimation();
    const textInputHeight = useSharedValue(17);
    const translateX = useSharedValue(0);
    const previousTranslateX = useSharedValue(0);
    const initialTouchLocation = useSharedValue<{ x: number; y: number } | null>(null);
    const { eventId } = useLocalSearchParams();

    const filters = useMemo(() => [
        { ids: [eventId] }, { kinds: [1], "#e": [eventId] }
    ], [eventId]);
    const { events } = useSubscribe({filters});
    
    const toolbarHeightStyle = useAnimatedStyle(() => {
        return {
            height: interpolate(
                progress.value,
                [0, 1],
                [52 + insets.bottom, insets.bottom + textInputHeight.value - 2]
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

    const {messages, replies} = useMemo(() => {
        const eventMap = new Map<NDKEventId, NDKEvent>();
        const replyMap = new Map<NDKEventId, NDKEvent[]>();

        for (const event of events) {
            if (eventMap.has(event.id)) continue;

            if (event.id === eventId) {
                eventMap.set(event.id, event);
                continue;
            }

            const replyTag = getReplyTag(event) ?? getRootTag(event);
            if (!replyTag || replyTag[1] === eventId) {
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

    const pan = Gesture.Pan()
        .minDistance(10)
        .onBegin((evt) => { initialTouchLocation.value = { x: evt.x, y: evt.y }; })
        .onStart(() => { previousTranslateX.value = translateX.value; })
        // Prevents blocking the scroll view and the swipe to go back gesture on iOS
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
            <Stack.Screen options={SCREEN_OPTIONS} />
            <GestureDetector gesture={pan}>
                <KeyboardAvoidingView
                    style={[
                        ROOT_STYLE,
                        { flex:1, backgroundColor: isDarkColorScheme ? colors.background : colors.card },
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
                            const isSameNextSender =
                                typeof nextMessage !== 'string' ? nextMessage?.sender === item.sender : false;

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
}

function header() {
  return <Header />;
}

const HEADER_POSITION_STYLE: ViewStyle = {
  position: 'absolute',
  zIndex: 50,
  top: 0,
  left: 0,
  right: 0,
};

const MOCK_CONVERSATION_INFO = {
  name: 'George Martinez',
  initials: 'GM',
};

function Header() {
  const { colors } = useColorScheme();
  const insets = useSafeAreaInsets();
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={100}
        style={[
          HEADER_POSITION_STYLE,
          {
            paddingTop: insets.top,
          },
        ]}>
        <View className="flex-row items-center justify-between px-4 pb-2">
          <View className="flex-row items-center">
            <Button variant="plain" size="icon" className="ios:justify-start" onPress={router.back}>
              <Icon size={30} color={colors.primary} name="chevron-left" />
              <View className="bg-primary h-5 w-5 -translate-x-4 items-center justify-center rounded-full">
                <Text variant="caption2" className="text-center leading-[14px] text-white">
                  3
                </Text>
              </View>
            </Button>
          </View>
          <Pressable className="items-center gap-2 active:opacity-70">
            <Avatar alt="avatar" className="h-12 w-12">
              <AvatarFallback className="z-50">
                <View className="opacity-90 dark:opacity-80">
                  <Text
                    className="dark:ios:text-white dark:text-background leading-6 text-white"
                    variant="title3">
                    {MOCK_CONVERSATION_INFO.initials}
                  </Text>
                </View>
              </AvatarFallback>
            </Avatar>
            <View className="flex-row items-center">
              <Text variant="caption1">{MOCK_CONVERSATION_INFO.name}</Text>
              <Icon name="chevron-right" size={12} color={colors.grey} />
            </View>
          </Pressable>
          <Button variant="plain" size="icon" className="ios:justify-start">
            <Icon size={28} color={colors.primary} name="video-outline" />
          </Button>
        </View>
      </BlurView>
    );
  }

  return (
    <View
      className="bg-card dark:bg-background absolute left-0 right-0 top-0 z-50 justify-end"
      style={{
        paddingTop: insets.top,
        height: HEADER_HEIGHT + insets.top,
      }}>
      <View
        style={{ height: HEADER_HEIGHT }}
        className="flex-row items-center justify-between gap-2 px-3 pb-2">
        <View className="flex-row items-center">
          <Button
            variant="plain"
            size="icon"
            className="ios:justify-start opacity-70"
            onPress={router.back}>
            <Icon
              color={colors.foreground}
              name={Platform.select({ ios: 'chevron-left', default: 'arrow-left' })}
            />
          </Button>
        </View>
        <View className="flex-1">
          <Button
            variant="plain"
            androidRootClassName="rounded-md"
            className="ios:px-0 min-h-10 flex-row items-center justify-start gap-3 rounded-md px-0">
            <View className="flex-1 flex-row items-center">
              <Text className="pb-0.5 text-lg font-normal" numberOfLines={1}>
                {MOCK_CONVERSATION_INFO.name}
              </Text>
            </View>
          </Button>
        </View>
        <Button variant="plain" size="icon" className="opacity-70">
          <Icon color={colors.foreground} name="video-outline" />
        </Button>
      </View>
    </View>
  );
}

function DateSeparator({ date }: { date: string }) {
  return (
    <View className="items-center px-4 pb-3 pt-5">
      <Text variant="caption2" className="text-muted-foreground font-medium">
        {date}
      </Text>
    </View>
  );
}

// Add as class when possible: https://github.com/marklawlor/nativewind/issues/522
const BORDER_CURVE: ViewStyle = {
  borderCurve: 'continuous',
};

const CONTEXT_MENU_ITEMS = [
  createContextItem({
    actionKey: 'reply',
    title: 'Reply',
    icon: { name: 'arrow-left-bold-outline' },
  }),
  createContextItem({
    actionKey: 'sticker',
    title: 'Sticker',
    icon: { name: 'plus-box-outline' },
  }),
  createContextItem({ actionKey: 'copy', title: 'Copy', icon: { name: 'clipboard-outline' } }),
];

function ChatBubble({
    item,
    isSameNextSender,
    translateX,
    replies
}: {
    item: MockMessage;
    isSameNextSender: boolean;
    translateX: SharedValue<number>;
    replies: NDKEvent[] | undefined;
}) {
  const contextMenuRef = React.useRef<ContextMenuRef>(null);
  const contextMenuRef2 = React.useRef<ContextMenuRef>(null);
  const { colors } = useColorScheme();
  const rootStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const dateStyle = useAnimatedStyle(() => {
    return {
      width: 75,
      position: 'absolute',
      right: 0,
      paddingLeft: 8,
      transform: [{ translateX: interpolate(translateX.value, [-75, 0], [0, 75]) }],
    };
  });

  const renderAuxiliaryPreview = React.useCallback(() => {
    function closeContextMenu() {
      contextMenuRef.current?.dismissMenu?.();
      contextMenuRef2.current?.dismissMenu?.();
    }
    return (
      <View
        className={cn(
          'bg-card flex-row gap-1 rounded-full p-0.5',
          Platform.OS === 'ios' && 'ios:bg-card/60 ios:dark:bg-border/70'
        )}>
        <Button
          size="icon"
          variant={item.reactions.love?.includes(ME) ? 'primary' : 'plain'}
          onPress={closeContextMenu}
          className="ios:rounded-full rounded-full">
          <Icon
            name="heart"
            size={24}
            color={item.reactions.love?.includes(ME) ? 'white' : colors.grey}
          />
        </Button>
        <Button
          size="icon"
          variant={item.reactions.like?.includes(ME) ? 'primary' : 'plain'}
          onPress={closeContextMenu}
          className="ios:rounded-full rounded-full">
          <Icon
            ios={{ name: 'hand.thumbsup.fill' }}
            materialIcon={{
              type: 'MaterialCommunityIcons',
              name: 'thumb-up',
            }}
            size={24}
            color={item.reactions.like?.includes(ME) ? 'white' : colors.grey}
          />
        </Button>
        <Button
          size="icon"
          variant={item.reactions.dislike?.includes(ME) ? 'primary' : 'plain'}
          onPress={closeContextMenu}
          className="ios:rounded-full rounded-full">
          <Icon
            ios={{ name: 'hand.thumbsdown.fill' }}
            materialIcon={{
              type: 'MaterialCommunityIcons',
              name: 'thumb-down',
            }}
            size={24}
            color={item.reactions.dislike?.includes(ME) ? 'white' : colors.grey}
          />
        </Button>
        <Button
          size="icon"
          variant={item.reactions.exclamation?.includes(ME) ? 'primary' : 'plain'}
          onPress={closeContextMenu}
          className="ios:rounded-full rounded-full">
          <Icon
            name="exclamation"
            size={24}
            color={item.reactions.exclamation?.includes(ME) ? 'white' : colors.grey}
          />
        </Button>
        <Button
          size="icon"
          variant={item.reactions.question?.includes(ME) ? 'primary' : 'plain'}
          onPress={closeContextMenu}
          className="ios:rounded-full rounded-full">
          <Icon
            ios={{ name: 'questionmark' }}
            materialIcon={{
              type: 'MaterialCommunityIcons',
              name: 'comment-question-outline',
            }}
            size={24}
            color={item.reactions.question?.includes(ME) ? 'white' : colors.grey}
          />
        </Button>
      </View>
    );
  }, [colors, item.reactions]);

  const auxiliaryPreviewPosition = React.useMemo(() => {
    const textIsLessThan25 = item.text.length < 25;

    return item.sender === ME
      ? textIsLessThan25
        ? 'end'
        : 'start'
      : textIsLessThan25
        ? 'start'
        : 'end';
  }, [item.text, item.sender]);

  return (
    <View
      className={cn(
        'justify-center px-2 pb-3.5',
        isSameNextSender ? 'pb-1' : 'pb-3.5',
        item.sender === ME ? 'items-end pl-16' : 'items-start pr-16'
      )}>
      <Animated.View style={item.sender === ME ? rootStyle : undefined}>
        {item.attachments.length > 0 ? (
          <View
            className={cn('flex-row items-center gap-4', item.sender === ME && 'flex-row-reverse')}>
            <View>
              <ContextMenu
                ref={contextMenuRef}
                style={{ borderRadius: 12 }}
                auxiliaryPreviewPosition={auxiliaryPreviewPosition}
                renderAuxiliaryPreview={renderAuxiliaryPreview}
                items={CONTEXT_MENU_ITEMS}
                onItemPress={({ actionKey }) => console.log(`${actionKey} pressed`)}>
                <Pressable>
                  <Image
                    source={{ uri: item.attachments[0].url }}
                    style={{ width: 200, height: 200, resizeMode: 'cover' }}
                    borderRadius={12}
                  />
                </Pressable>
              </ContextMenu>
              {item.reactions.like?.includes(ME) && (
                <View
                  className={cn(
                    'bg-card dark:bg-background absolute -top-3 rounded-full p-px',
                    item.sender === ME ? '-left-5' : '-right-5'
                  )}>
                  <View className="bg-primary rounded-full p-1">
                    <Icon
                      ios={{ name: 'hand.thumbsup.fill' }}
                      materialIcon={{
                        type: 'MaterialCommunityIcons',
                        name: 'thumb-up',
                      }}
                      size={18}
                      color="white"
                    />
                    {Platform.OS === 'ios' && (
                      <>
                        <View
                          className={cn(
                            'bg-primary absolute bottom-0 h-2 w-2 rounded-full',
                            item.sender === ME ? 'left-0' : 'right-0'
                          )}
                        />
                        <View
                          className={cn(
                            'bg-primary absolute -bottom-1 h-1 w-1 rounded-full',
                            item.sender === ME ? '-left-1' : '-right-1'
                          )}
                        />
                      </>
                    )}
                  </View>
                </View>
              )}
            </View>
            <Button
              size="icon"
              variant="secondary"
              className="ios:rounded-full ios:border-border ios:h-10 ios:w-10 border-border h-8 w-8 rounded-full"
              androidRootClassName="rounded-full">
              <Icon
                name="arrow-down"
                ios={{ name: 'arrow.down.square', renderingMode: 'hierarchical' }}
                color={colors.primary}
                size={Platform.select({ ios: 27, default: 21 })}
              />
            </Button>
          </View>
        ) : (
          <View>
            <View
              className={cn(
                'absolute bottom-0 items-center justify-center',
                item.sender === ME ? '-right-2.5' : '-left-2 '
              )}>
              {Platform.OS === 'ios' && (
                <>
                  <View
                    className={cn(
                      'h-5 w-5 rounded-full',
                      item.sender === ME
                        ? 'bg-primary'
                        : Platform.OS === 'ios'
                          ? 'bg-background dark:bg-muted'
                          : 'bg-background dark:bg-muted-foreground'
                    )}
                  />
                  <View
                    className={cn(
                      'bg-card dark:bg-background absolute h-5 w-5 rounded-full',
                      item.sender === ME ? '-right-2' : 'right-2'
                    )}
                  />
                  <View
                    className={cn(
                      'bg-card dark:bg-background absolute  h-5 w-5  -translate-y-1 rounded-full',
                      item.sender === ME ? '-right-2' : 'right-2'
                    )}
                  />
                </>
              )}
            </View>
            <View>
                <ContextMenu
                    ref={contextMenuRef2}
                    auxiliaryPreviewPosition={auxiliaryPreviewPosition}
                    items={CONTEXT_MENU_ITEMS}
                    style={{ borderRadius: 20 }}
                    renderAuxiliaryPreview={renderAuxiliaryPreview}
                    onItemPress={({ actionKey }) => console.log(`${actionKey} pressed`)}>
                    <Pressable onPress={() => router.push(`/messages/thread?eventId=${item.event.id}`)}>
                    <View
                        style={BORDER_CURVE}
                        className={cn(
                        'bg-background dark:bg-muted-foreground rounded-2xl px-3 py-1.5',
                        Platform.OS === 'ios' && 'dark:bg-muted',
                        item.sender === ME && 'bg-primary dark:bg-primary'
                    )}>
                        <Text className={cn(item.sender === ME && 'text-white')}>
                            <EventContent event={item.event} />
                        </Text>
                    </View>
                    {replies && replies.length > 0 && (
                        <Text className="text-muted-foreground text-sm">
                            {replies.length} replies
                        </Text>
                    )}
                </Pressable>
              </ContextMenu>
              {item.reactions.like?.includes(ME) && (
                <View
                  className={cn(
                    'bg-card dark:bg-background absolute -top-3 rounded-full p-px',
                    item.sender === ME ? '-left-5' : '-right-5'
                  )}>
                  <View className="bg-primary rounded-full p-1">
                    <Icon
                      ios={{ name: 'hand.thumbsup.fill' }}
                      materialIcon={{
                        type: 'MaterialCommunityIcons',
                        name: 'thumb-up',
                      }}
                      size={18}
                      color="white"
                    />
                    {Platform.OS === 'ios' && (
                      <>
                        <View
                          className={cn(
                            'bg-primary absolute bottom-0 h-2 w-2 rounded-full',
                            item.sender === ME ? 'left-0' : 'right-0'
                          )}
                        />
                        <View
                          className={cn(
                            'bg-primary absolute -bottom-1 h-1 w-1 rounded-full',
                            item.sender === ME ? '-left-1' : '-right-1'
                          )}
                        />
                      </>
                    )}
                  </View>
                </View>
              )}

              <View className="flex-row items-center gap-2">
                    <User.Profile pubkey={item.event.pubkey}>
                        <User.Avatar className="ios:h-5 ios:w-5" />
                        
                        <Text className="text-muted-foreground text-sm">
                            <User.Name />
                        </Text>
                    </User.Profile>
                </View>
                </View>
          </View>
        )}
        {item.sender === ME && !!item.isRead && (
          <View className="items-end pt-0.5">
            <Text variant="caption2" className="text-muted-foreground font-medium">
              Read{' '}
              <Text variant="caption2" className="text-muted-foreground font-normal">
                Yesterday
              </Text>
            </Text>
          </View>
        )}
      </Animated.View>

      <Animated.View style={dateStyle} className="justify-center">
        <Text variant="caption1" className="text-muted-foreground">
          {item.time}
        </Text>
      </Animated.View>
    </View>
  );
}

const COMPOSER_STYLE: ViewStyle = {
  position: 'absolute',
  zIndex: 50,
  bottom: 0,
  left: 0,
  right: 0,
};

const TEXT_INPUT_STYLE: TextStyle = {
  borderCurve: 'continuous',
  maxHeight: 300,
};

function Composer({
  textInputHeight,
  setMessages,
}: {
  textInputHeight: SharedValue<number>;
  setMessages: React.Dispatch<React.SetStateAction<(typeof MOCK_MESSAGES)[number][]>>;
}) {
  const { colors, isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');

  function onContentSizeChange(event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) {
    textInputHeight.value = Math.max(
      Math.min(event.nativeEvent.contentSize.height, 280),
      Platform.select({ ios: 20, default: 38 })
    );
  }

  function sendMessage() {
    setMessages((prev) => [
      {
        attachments: [],
        id: Math.random().toString(),
        reactions: {},
        readBy: [],
        sender: ME,
        text: message,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
      ...prev,
    ]);
    setMessage('');
  }

  return (
    <BlurView
      intensity={Platform.select({ ios: 50, default: 0 })}
      style={[
        COMPOSER_STYLE,
        {
          backgroundColor: Platform.select({
            ios: isDarkColorScheme ? '#00000080' : '#ffffff80',
            default: isDarkColorScheme ? colors.background : colors.card,
          }),
          paddingBottom: insets.bottom,
        },
      ]}>
      <View className="flex-row items-end gap-2 px-4 py-2">
        <Button size="icon" className="bg-muted/30 ios:rounded-full mb-0.5 h-8 w-8 rounded-full">
          <Icon name="plus" size={18} color={colors.foreground} />
        </Button>
        <TextInput
          placeholder="Message"
          style={TEXT_INPUT_STYLE}
          className="ios:pt-[7px] ios:pb-1 border-border bg-background text-foreground min-h-9 flex-1 rounded-[18px] border py-1 pl-3 pr-8 text-base leading-5"
          placeholderTextColor={colors.grey2}
          multiline
          onContentSizeChange={onContentSizeChange}
          onChangeText={setMessage}
          value={message}
        />
        <View className="absolute bottom-3 right-5">
          {message.length > 0 ? (
            <Button
              onPress={sendMessage}
              size="icon"
              className="ios:rounded-full h-7 w-7 rounded-full">
              <Icon name="arrow-up" size={18} color="white" />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="plain"
              className="ios:rounded-full h-7 w-7 rounded-full opacity-40">
              <Icon name="microphone" size={20} color={colors.foreground} />
            </Button>
          )}
        </View>
      </View>
    </BlurView>
  );
}

type MockMessage = {
  id: string;
  sender: string;
  text: string;
  date: string;
  time: string;
  event: NDKEvent;
  reactions: {
    like?: string[];
    love?: string[];
    dislike?: string[];
    exclamation?: string[];
    question?: string[];
  };
  isRead?: boolean;
  attachments: { type: string; url: string }[];
};
