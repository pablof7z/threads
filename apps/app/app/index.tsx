import { Text } from "@/components/nativewindui/Text";
import { useNDK, useSubscribe } from "@/ndk-expo";
import { useNDKWallet } from "@/ndk-expo/providers/wallet";
import { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKRelaySet } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet, NDKWalletBalance, NDKWalletChange } from "@nostr-dev-kit/ndk-wallet";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, TouchableHighlight, View } from "react-native";
import { useColorScheme } from '~/lib/useColorScheme';
import RelativeTime from "./components/relative-time";
import { Link, router } from "expo-router";
import { walleteStore } from "./stores";
import { useStore } from "zustand";
import WelcomeConsentScreen from "./welcome";
import { Button } from "@/components/nativewindui/Button";
import { Icon } from "@roninoss/icons";
import { prettifySatoshis } from "@/lib/utils";
import {List} from "@/components/nativewindui/List";

function WalletCard({ wallet }: { wallet: NDKCashuWallet }) {
    const [balance, setBalance] = useState<NDKWalletBalance[] | undefined>(undefined);
    const { colors } = useColorScheme();
    const filters = useMemo(() => ([
        { limit: 1, kinds: [NDKKind.WalletChange, NDKKind.CashuToken], authors: [wallet.event.pubkey], ...wallet.event.filter() }
    ]), [wallet.event]);
    const { events } = useSubscribe({filters});
    const { setActiveWallet } = useStore(walleteStore)

    useEffect(() => {
        wallet.balance().then((b) => setBalance(b));

        const updateBalance = () => {
            wallet.balance().then((b) => setBalance(b));
        }
        wallet.on("balance_updated", updateBalance);

        return () => {
            wallet.off("balance_updated", updateBalance);
        }
    }, [wallet]);

    return (
        <Pressable onPress={() => {
            setActiveWallet(wallet);
            router.push(`/(wallet)`);
        }}>
            <View style={{...styles.card, backgroundColor: colors.primary}}>
                <Text style={styles.title}>{wallet.name ?? 'Untitled'}</Text>
                <Text style={styles.balance}>
                    {balance?.[0]?.amount ? prettifySatoshis(balance?.[0]?.amount, 0) : '0'}
                    <Text style={styles.currency}>{balance?.[0]?.unit}</Text>
                </Text>
                <View className="flex-row items-center gap-1">
                    <Text className="text-sm text-white">
                        {wallet.mints.length} mints
                    </Text>

                    <Text className="text-sm text-white">
                        {wallet.tokens.length} tokens
                    </Text>

                </View>
                <Text style={styles.transaction}>Latest transaction</Text>
                <Text style={styles.time}>
                    {events && events.length > 0 ? (
                        <RelativeTime timestamp={events[0].created_at!} />
                    ) : (
                        'Never'
                    )}
                </Text>
            </View>
        </Pressable>
    );
}

function TransactionItem({ event }: { event: NDKEvent }) {
    const [change, setChange] = useState<NDKWalletChange | undefined>(undefined);

    useEffect(() => {
        if (event.kind === NDKKind.WalletChange) {
            NDKWalletChange.from(event).then(setChange);
        }
    }, [event]);

    if (event.kind === NDKKind.WalletChange) {
        if (!change) return <Text>Loading...</Text>;
        else return (
            <View key={event.id} className="flex-row items-start gap-1 w-full mb-4">
                <View className="flex-1">
                    <Text className="text-xs text-gray-500">
                        {change.mint}
                    </Text>
                </View>
                <Text style={{ color: change.direction === 'in' ? 'green' : 'red' }}>
                    {change.amount}
                    {change.unit}
                </Text>
            </View>
        );
    }

    return <Text className="font-semibold">Token</Text>;
}

function TransactionList() {
    const { currentUser } = useNDK();
    const filters = useMemo(() => (currentUser ? [
        { limit: 10, kinds: [NDKKind.WalletChange], authors: [currentUser?.pubkey] }
    ] : null), [currentUser]);
    const { events } = useSubscribe({filters});

    return (
        <View className="flex-1 bg-card gap-2 w-full p-4">
            <Text className="text-3xl font-bold">Transactions</Text>

            <List
                data={events}
                keyExtractor={(item) => item.id}
                estimatedItemSize={50}
                renderItem={(item) => (
                    <TransactionItem event={item} />
                )}
            />
        </View>
    );
}

export default function WalletsScreen() {
    const { walletService } = useNDKWallet();
    const { ndk, currentUser } = useNDK();
    const { colors } = useColorScheme();
    const { setActiveWallet } = useStore(walleteStore)
    const wallets = useMemo(() => (
        ((walletService?.wallets as NDKCashuWallet[])||[])
        .sort((a, b) => b.tokens.length - a.tokens.length)
    ), [walletService?.wallets]);

    if (!currentUser) {
        return <WelcomeConsentScreen />
    }

    const newWallet = async () => {
        const wallet = new NDKCashuWallet(ndk!);
        wallet.name = 'New Wallet';
        wallet.relays = (ndk?.pool.connectedRelays() || []).map((r) => r.url);
        await wallet.publish();

        setActiveWallet(wallet);

        router.push('/(wallet)/')
        setTimeout(() => router.push('/(wallet)/(settings)'), 100);
    }

    return (
        <View className="flex-1 bg-card gap-2">
            <FlatList
                horizontal
                data={[...wallets, {id: 'new-wallet'}]}
                keyExtractor={(item) => item.event?.id ?? item.id}
                renderItem={({ item }) => (
                    item.id === 'new-wallet' ? (
                        <TouchableHighlight onPress={newWallet} style={{...styles.card, backgroundColor: colors.grey4}}>
                            <Icon name="plus-box-outline" size={24} color={colors.foreground} />
                        </TouchableHighlight>
                    ) : (
                        <WalletCard wallet={item} />
                    )
                )}
                contentContainerStyle={styles.listContainer}
                style={{ height: 240, flexGrow: 0 }}
            />

            <TransactionList />
        </View>
    );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    elevation: 4,
    alignItems: 'flex-start',
    marginVertical: 10,
    marginHorizontal: 16,
    height: 200,
    width: Dimensions.get('window').width * 0.75,
  },
  title: {
    fontSize: 16,
    color: '#ffffffa0', // Lighter translucent white for title
    marginBottom: 4,
    fontWeight: '500',
  },
  balance: {
    fontSize: 42, // Reduced font size slightly to fit within the card
    lineHeight: 52,
    fontWeight: '700',
    color: '#fff',
  },
  currency: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffffa0', // Matches the BTC color with lighter opacity
  },
  transaction: {
    marginTop: 15,
    fontSize: 14,
    color: '#ffffff90', // Slightly translucent for subtlety
  },
  time: {
    fontSize: 14,
    color: '#ffffffc0', // Higher opacity than "transaction" for emphasis
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
});
