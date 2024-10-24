import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import * as User from '@/ndk-expo/components/user';
import { Hexpubkey, NDKEvent } from '@nostr-dev-kit/ndk';

interface AvatarGroupProps {
    events?: NDKEvent[];
    pubkeys?: Hexpubkey[];
    avatarSize: number;
    threshold: number;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ events, pubkeys, avatarSize, threshold = 3 }) => {
    const pubkeyCounts = useMemo(() => {
        if (!events) return {};

        const counts: Record<string, number> = {};
        events.forEach(event => {
            counts[event.pubkey] = (counts[event.pubkey] || 0) + 1;
        });
        return counts;
    }, [events]);

    const sortedPubkeys = useMemo(() => {
        if (pubkeys) return pubkeys;
        
        return Object.entries(pubkeyCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([pubkey]) => pubkey);
    }, [pubkeyCounts, pubkeys]);

    return (
        <View className="flex flex-row">
            {sortedPubkeys.slice(0, threshold).map((pubkey, index) => (
                <User.Profile key={pubkey} pubkey={pubkey}>
                    <User.Avatar
                        alt={pubkey}
                        className={`h-${avatarSize} w-${avatarSize}`}
                        style={{ marginLeft: index > 0 ? -(avatarSize*1.5) : 0 }}
                    />
                </User.Profile>
            ))}

            {sortedPubkeys.length > threshold && (
                <View
                    className={`h-${avatarSize} w-${avatarSize} items-center justify-center bg-gray-200 rounded-full`}
                    style={{ marginLeft: -10 }}
                >
                    <Text className="text-sm text-gray-700">+{sortedPubkeys.length - threshold}</Text>
                </View>
            )}
        </View>
    );
};

export default AvatarGroup;
