import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Text } from '~/components/nativewindui/Text';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { MockMessage } from '../messages/thread';
import { useColorScheme } from '~/lib/useColorScheme';
import { Image } from 'expo-image';

export function ChatBubble({
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
                <Pressable>
                  <Image
                    source={{ uri: item.attachments[0].url }}
                    style={{ width: 200, height: 200, resizeMode: 'cover' }}
                    borderRadius={12}
                  />
                </Pressable>
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


export function DateSeparator({ date }: { date: string }) {
    return (
        <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{date}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingBottom: 14,
    },
    sameSender: {
        paddingBottom: 4,
    },
    differentSender: {
        paddingBottom: 14,
    },
    bubble: {
        backgroundColor: '#e1ffc7',
        borderRadius: 20,
        padding: 10,
    },
    text: {
        color: '#000',
    },
    time: {
        fontSize: 12,
        color: '#888',
        textAlign: 'right',
    },
    dateSeparator: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    dateText: {
        fontSize: 12,
        color: '#888',
    },
    replies: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
});
