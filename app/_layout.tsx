import '../global.css';
import 'expo-dev-client';
import "@bacons/text-decoder/install";
import "react-native-get-random-values";
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { NDKCacheAdapterSqlite, useNDK } from "@/ndk-expo";
import { Link, router, Stack, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';  
import { Platform, View, SafeAreaView, Pressable, TouchableOpacity } from 'react-native';
import { ActivityIndicator } from '~/components/nativewindui/ActivityIndicator';

import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import { NDKProvider } from '~/ndk-expo';
import { NDKWalletProvider } from '@/ndk-expo/providers/wallet';
import { Text } from '@/components/nativewindui/Text';
import { Icon } from '@roninoss/icons';
import { cn } from '@/lib/cn';
import { NDKEvent, NDKPrivateKeySigner, NDKRelay, NDKRelaySet, NostrEvent } from '@nostr-dev-kit/ndk';
import { useMemo, useState } from 'react';

export {
  ErrorBoundary,
} from 'expo-router';

function UnpublishedEventIndicator() {
    const { ndk, useUnpublishedEventStore } = useNDK();
    const unpublishedEvents = useUnpublishedEventStore ? useUnpublishedEventStore(store => store.unpublishedEvents) : [];
    const [publishing, setPublishing] = useState(false);

    // if (unpublishedEvents.length === 0) return null;

    async function publish() {
        if (!ndk) return;
        setPublishing(true);

        for (let e of unpublishedEvents) {
            await e.publish();
            break;
        }

        setPublishing(false);
    }

    return (
        <TouchableOpacity onPress={() => {
            if (!ndk) return;

            const signer = NDKPrivateKeySigner.generate();
            const e = new NDKEvent(ndk, { kind: 9 } as NostrEvent);
            const relay = NDKRelaySet.fromRelayUrls(['wss://relay1.com'], ndk)

            e.sign(signer).then(() => {e.publish(relay).catch(console.log)});
        }}>
            <TouchableOpacity onPress={publish}>
                <View className='bg-red-500 px-2 py-1 rounded-md'>
                    <Text className="text-white text-xs">
                        {unpublishedEvents.length}
                    </Text>
                </View>
            </TouchableOpacity>
            {(publishing && unpublishedEvents.length > 0) && <ActivityIndicator />}
        </TouchableOpacity>
    )
}

export default function RootLayout() {
    useInitialAndroidBarSync();
    const { colors } = useColorScheme();
    const { colorScheme, isDarkColorScheme } = useColorScheme();

    const netDebug = (msg: string, relay: NDKRelay, direction?: 'send' | 'recv') => {
        const url = new URL(relay.url);
        if (direction === 'send') console.log('👉', url.hostname, msg);
    }

    return (
        <>
            <StatusBar
                key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
                style={isDarkColorScheme ? 'light' : 'dark'}
            />
            <NDKProvider
                explicitRelayUrls={['ws://localhost:2929']}
                cacheAdapter={new NDKCacheAdapterSqlite("nutsack")}
                netDebug={netDebug}
            >
                <NDKWalletProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
                            <NavThemeProvider value={NAV_THEME[colorScheme]}>
                                <Stack
                                    screenOptions={{
                                    animation: 'ios',
                                    title: "Home",
                                    headerShown: true,
                                    headerTintColor: Platform.OS === 'ios' ? undefined : colors.foreground,
                                }}>
                                    <Stack.Screen name="index" options={{
                                        headerShown: true,
                                        headerLeft: () => (
                                            <UnpublishedEventIndicator />
                                        ),
                                        headerTitle: () => <Text>Wallets</Text>,
                                        headerRight: () => (
                                            <Link href="/new-wallet">
                                                <Icon name="plus-box-outline" size={24} color={colors.foreground} />
                                            </Link>
                                        )
                                    }} />
                                    <Stack.Screen name="(wallet)" options={{
                                        headerShown: true,
                                        title: 'test',
                                        headerRight: () => <SettingsIcon />,
                                    }} />

                                    
                                    {/* <Stack.Screen name="(settings)" options={SETTINGS_OPTIONS} /> */}
                                    <Stack.Screen name="login" options={LOGIN_OPTIONS} />
                                    <Stack.Screen name="new-wallet" options={{
                                        presentation: 'modal',
                                        title: 'New Wallet',
                                        animation: 'fade_from_bottom',
                                    }} />
                                </Stack>
                            </NavThemeProvider>
                        </KeyboardProvider>
                    </GestureHandlerRootView>
                </NDKWalletProvider>
            </NDKProvider>
        </>
    );
}

const LOGIN_OPTIONS = {
  presentation: 'modal',
  headerShown: false,
  animation: 'fade_from_bottom', // for android
} as const;

function SettingsIcon() {
    const { colors } = useColorScheme();
    return (
      <Link href="/(wallet)/(settings)" asChild>
        <Pressable className="opacity-80 pr-2">
          {({ pressed }) => (
            <View className={cn(pressed ? 'opacity-50' : 'opacity-90')}>
              <Icon name="cog-outline" size={32} color={colors.foreground} />
            </View>
          )}
        </Pressable>
      </Link>
    );
} 