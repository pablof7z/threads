import { useNDK } from '@/ndk-expo';
import { Icon, MaterialIconName } from '@roninoss/icons';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import * as User from '@/ndk-expo/components/user';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { LargeTitleHeader } from '~/components/nativewindui/LargeTitleHeader';
import {
  ESTIMATED_ITEM_HEIGHT,
  List,
  ListDataItem,
  ListItem,
  ListRenderItemInfo,
  ListSectionHeader,
} from '~/components/nativewindui/List';
import { Text } from '~/components/nativewindui/Text';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';
import { NDKPrivateKeySigner, NDKRelay, NDKRelayStatus, NDKUser } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';

const CONNECTIVITY_STATUS_COLORS: Record<NDKRelayStatus, string> = {
    [NDKRelayStatus.RECONNECTING]: '#f1c40f',
    [NDKRelayStatus.CONNECTING]: '#f1c40f',
    [NDKRelayStatus.DISCONNECTED]: '#aa4240',
    [NDKRelayStatus.DISCONNECTING]: '#aa4240',
    [NDKRelayStatus.CONNECTED]: '#e74c3c',
    [NDKRelayStatus.FLAPPING]: '#2ecc71',
    [NDKRelayStatus.AUTHENTICATING]: '#3498db',
    [NDKRelayStatus.AUTHENTICATED]: '#e74c3c',
    [NDKRelayStatus.AUTH_REQUESTED]: '#e74c3c',
} as const;

function RelayConnectivityIndicator({ relay }: { relay: NDKRelay }) {
    const color = CONNECTIVITY_STATUS_COLORS[relay.status]
    
    return (
        <View style={{ borderRadius: 10, width: 8, height: 8, backgroundColor: color }}></View>
    )
}

export default function RelaysScreen() {
    const { ndk } = useNDK();
    const [ searchText, setSearchText ] = useState<string | null>(null);

    const data = useMemo(() => {
        if (!ndk) return [];
        
        return Array.from(ndk.pool.relays.values())
            .map((relay: NDKRelay) => ({
                id: relay.url,
                title: relay.url,
                rightView: <View className="flex-1 items-center px-4 py-2">
                    <RelayConnectivityIndicator relay={relay} />
                </View>
            }))
            .filter(item => (searchText??'').trim().length === 0 || item.title.match(searchText!))
  }, [ndk?.pool.relays, searchText]);

  return (
    <>
        <LargeTitleHeader title="Relays" searchBar={{ iosHideWhenScrolling: true, onChangeText: setSearchText }} />
        <List
            contentContainerClassName="pt-4"
            contentInsetAdjustmentBehavior="automatic"
            variant="insets"
            data={data}
            estimatedItemSize={ESTIMATED_ITEM_HEIGHT.titleOnly}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            sectionHeaderAsGap
        />


    </>
  );
}

function renderItem<T extends (typeof data)[number]>(info: ListRenderItemInfo<T>) {
  if (typeof info.item === 'string') {
    return <ListSectionHeader {...info} />;
  }
  return (
    <ListItem
      className={cn(
        'ios:pl-0 pl-2',
        info.index === 0 && 'ios:border-t-0 border-border/25 dark:border-border/80 border-t'
      )}
      titleClassName="text-lg"
      leftView={info.item.leftView}
      rightView={info.item.rightView ?? (
        <View className="flex-1 flex-row items-center justify-center gap-2 px-4">
          {info.item.rightText && (
            <Text variant="callout" className="ios:px-0 text-muted-foreground px-2">
              {info.item.rightText}
            </Text>
          )}
          {info.item.badge && (
            <View className="bg-destructive h-5 w-5 items-center justify-center rounded-full">
              <Text variant="footnote" className="text-destructive-foreground font-bold leading-4">
                {info.item.badge}
              </Text>
            </View>
          )}
          <ChevronRight />
        </View>
      )}
      {...info}
      onPress={() => console.log('onPress')}
    />
  );
}

function ChevronRight() {
  const { colors } = useColorScheme();
  return <Icon name="chevron-right" size={17} color={colors.grey} />;
}

function IconView({ className, name }: { className?: string; name: MaterialIconName }) {
  return (
    <View className="px-3">
      <View className={cn('h-6 w-6 items-center justify-center rounded-md', className)}>
        <Icon name={name} size={15} color="white" />
      </View>
    </View>
  );
}

function keyExtractor(item: (Omit<ListDataItem, string> & { id: string }) | string) {
  return typeof item === 'string' ? item : item.id;
}