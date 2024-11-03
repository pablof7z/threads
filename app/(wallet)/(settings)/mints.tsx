import { useNDK, useSubscribe } from '@/ndk-expo';
import { Icon, MaterialIconName } from '@roninoss/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, View } from 'react-native';

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
import { NDKKind, NDKRelay, NDKRelayStatus, NDKUser } from '@nostr-dev-kit/ndk';
import { walleteStore } from '@/app/stores';
import { useStore } from 'zustand';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { Button } from '@/components/nativewindui/Button';
import MintListItem from '@/components/cashu/mint/list/item';

export default function RelaysScreen() {
    const { ndk } = useNDK();
    const { activeWallet } = useStore(walleteStore)
    const [ searchText, setSearchText ] = useState<string | null>(null);
    const [url, setUrl] = useState<string>("");
    const [mints, setMints] = useState<string[]>(activeWallet?.mints??[]);

    const filter = useMemo(() => ([{ kinds: [38172], limit: 50 }]), [1]);
    const opts = useMemo(() => ({ groupable: false, closeOnEose: true, subId: 'mints' }), []);
    const { events: mintList } = useSubscribe({ filters: filter, opts });

    const data = useMemo(() => {
        if (!ndk || !activeWallet) return []
        const regexp = new RegExp(/${searchText}/i)

        return mints.map(mint => ({
            id: mint,
            title: mint,
        }))
        .filter(item => (searchText??'').trim().length === 0 || item.title.match(regexp!))
  }, [mints, searchText]);

    const addFn = () => {
        try {
            const uri = new URL(url)
            if (!['https:', 'http:'].includes(uri.protocol)) {
                alert("Invalid protocol")
                return;
            }
            setMints([...mints, url])
            setUrl("");
        } catch (e) {
            alert("Invalid URL")
        }
    };

    const save = () => {
        if (!activeWallet) return;

        activeWallet.mints = mints;
        activeWallet.publish().then(() => {
            router.back()
        })
    }

    const unselectedMints = useMemo(() => mintList.filter(m => {
        const url = m.tagValue("u");
        if (!url || mints.includes(url)) return false;
        return true;
    }).map(m => m.tagValue("u")), [ mintList])

    const addMint = (url: string) => {
        setMints([...mints, url])
    }

    const removeMint = (url: string) => {
        setMints(mints.filter(u => u !== url));
    }
  

  return (
    <>
        <LargeTitleHeader
          title="Mints"
          searchBar={{ iosHideWhenScrolling: true, onChangeText: setSearchText }}
          rightView={() => (
            <TouchableOpacity onPress={save}>
                <Text className="text-primary">Save</Text>
            </TouchableOpacity>
          )}
        />
        <View className="flex-1">
            <List
                contentContainerClassName="pt-4"
                contentInsetAdjustmentBehavior="automatic"
                variant="insets"
                data={[...data, {id: 'add', fn: addFn, set: setUrl}, 'gap-2', ...unselectedMints]}
                estimatedItemSize={ESTIMATED_ITEM_HEIGHT.titleOnly}
                renderItem={renderItem(addMint, removeMint)}
                keyExtractor={keyExtractor}
                sectionHeaderAsGap
            />
        </View>
    </>
  );
}

function renderItem(addMint, removeMint) {
    return function renderItem<T extends (typeof data)[number]>(info: ListRenderItemInfo<T>) {
        if (info.item.id === 'add') {
            return (
                <ListItem
                    className={cn(
                    'ios:pl-0 pl-2',
                    info.index === 0 && 'ios:border-t-0 border-border/25 dark:border-border/80 border-t'
                    )}
                    titleClassName="text-lg"
                    leftView={info.item.leftView}
                    rightView={(
                        <TouchableOpacity onPress={info.item.fn}>
                            <Text className="text-primary pr-4 mt-2">Add</Text>
                        </TouchableOpacity>
                    )}
                    {...info}
                >
                <TextInput
                    className="flex-1 text-lg"
                    placeholder="Add mint"
                    onChangeText={info.item.set}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                </ListItem>
            )
        } else if (info.item.kind === 38172) {
        }
            return (
                <ListItem
                    className={cn(
                        'ios:pl-0 pl-2',
                        info.index === 0 && 'ios:border-t-0 border-border/25 dark:border-border/80 border-t'
                    )}
                    titleClassName="text-lg"
                    leftView={info.item.leftView}
                    rightView={(
                        <TouchableOpacity onPress={info.item.fn}>
                            <Text className="text-neutral pr-4 mt-2">
                                <Icon name="trash-can-outline" size={20} />
                            </Text>
                        </TouchableOpacity>
                    )}
                    {...info}
                    onPress={() => console.log('onPress')}
                />
        );
    }
}

function ChevronRight() {
  const { colors } = useColorScheme();
  return <Icon name="chevron-right" size={17} color={colors.grey} />;
}

function keyExtractor(item: (Omit<ListDataItem, string> & { id: string }) | string) {
  return typeof item === 'string' ? item : item.id;
}