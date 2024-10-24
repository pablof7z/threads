import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { ListItem, ListRenderItemInfo } from '~/components/nativewindui/List';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import { useSubscribe } from '@/ndk-expo';
import { NDKSimpleGroupMetadata, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
import { Icon } from '@roninoss/icons';
import Swipeable from '@/components/ui/Swipable';
import { cn } from '~/lib/cn';
import { Avatar, AvatarImage } from '~/components/nativewindui/Avatar';
import { RenderTarget } from '@shopify/flash-list';

type GroupRowProps = {
    groupMetadata: NDKSimpleGroupMetadata;
    onPress: () => void;
    index: number;
    target: RenderTarget;
};

const TEXT_STYLE = {
    paddingRight: 96,
};

export default function GroupRow({ groupMetadata, onPress, index, target }: GroupRowProps) {
    const { colors } = useColorScheme();

    const groupId = groupMetadata.dTag;
    const filters = useMemo(() => ({ kinds: [9, 10, 11, 12, 30023], "#h": [groupId], limit: 5 }), []);
    const opts = useMemo(() => ({ cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY, }), []);
    const { events: groupEvents } = useSubscribe({ filters, opts });

    const mostRecentEvent = useMemo(() => groupEvents.sort((a, b) => a.created_at! - b.created_at!).pop(), [groupEvents]);

    const imageUrl = groupMetadata.picture;
    const name = groupMetadata.name ?? groupId;

    const item = useMemo(() => ({
        item: groupMetadata,
        index,
        target,
        title: name,
        subTitle: mostRecentEvent?.content,
    }), [groupMetadata, index, target, name, mostRecentEvent?.content]);

    const messageCount = useMemo(() => groupEvents.length, [groupEvents]);

    return (
        <Swipeable isUnread={true}>
            <ListItem
                item={item}
                textNumberOfLines={1}
                subTitleNumberOfLines={1}
                onLongPress={noop}
                onPress={onPress}
                className={cn(
                    'h-[88px]',
                    index === 0 && 'ios:border-t-0 border-border/25 dark:border-border/80 border-t'
                )}
                titleStyle={TEXT_STYLE}
                titleClassName="font-medium text-lg"
                leftView={
                    <View className="flex-1 flex-row items-center px-3 py-3 pl-2 h-12 ios:border-b border-border dark:border-border/80">
                        {imageUrl ? (
                            <Avatar className="rounded-lg w-12 h-12">
                                <AvatarImage
                                    source={{
                                        uri: imageUrl,
                                    }}
                                />
                            </Avatar>
                        ) : (
                            <View className="w-12 h-12 bg-gray-200 rounded-lg items-center justify-center">
                                <Icon name="plus" size={14} color={colors.grey} />
                            </View>
                        )}
                    </View>
                }
                rightView={
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                        <View className="flex-row items-center">
                            <Text className="text-muted-foreground text-sm">
                                {messageCount > 0 ? messageCount : ''}
                            </Text>
                        </View>
                        <View className="pr-3">
                            <Icon name="chevron-right" size={14} color={colors.grey} />
                        </View>
                    </View>
                }
            >
            </ListItem>
        </Swipeable>
    );
}

function noop() {}
