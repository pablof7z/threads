import '../global.css';
import 'expo-dev-client';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { NDKCacheAdapterSqlite } from "@/ndk-expo";
import { Link, router, Stack, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';  
import { Platform, View, SafeAreaView } from 'react-native';

import { ThemeToggle } from '~/components/ThemeToggle';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import { NDKProvider } from '~/ndk-expo';
import { NDKWalletProvider } from '@/ndk-expo/providers/wallet';
import { Text } from '@/components/nativewindui/Text';
import { Icon } from '@roninoss/icons';

export {
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
    useInitialAndroidBarSync();
    const { colors } = useColorScheme();
    const { colorScheme, isDarkColorScheme } = useColorScheme();
    
    return (
        <>
            <StatusBar
                key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
                style={isDarkColorScheme ? 'light' : 'dark'}
            />
            <NDKProvider
                explicitRelayUrls={['ws://localhost:2929']}
                cacheAdapter={new NDKCacheAdapterSqlite("nutsack")}
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
                                <Stack.Screen name="(home)" options={{
                                    headerShown: false,
                                    title: 'Threads',
                                }} />
                                <Stack.Screen name="login" options={LOGIN_OPTIONS} />
                                <Stack.Screen name="relays" options={RELAYS_OPTIONS} />
                                <Stack.Screen name="(wallet)" options={{
                                    headerShown: true,
                                    headerTitle: () => <Text>Wallet</Text>,
                                    headerRight: () => (
                                        <Link href="/(wallets)">
                                            <Icon name="inbox-multiple-outline" size={24} color={colors.foreground} />
                                        </Link>
                                    )
                                }} />
                                <Stack.Screen name="(wallets)" options={{
                                    headerShown: true,
                                    headerTitle: () => <Text>Wallets</Text>,
                                    headerRight: () => (
                                        <Link href="/new-wallet">
                                            <Icon name="plus-box-outline" size={24} color={colors.foreground} />
                                        </Link>
                                    )
                                }} />
                                <Stack.Screen name="(settings)" options={SETTINGS_OPTIONS} />
                                <Stack.Screen name="new-wallet" options={{
                                    presentation: 'modal',
                                    title: 'New Wallet',
                                    animation: 'fade_from_bottom',
                                }} />
                                <Stack.Screen
                                    name="article"
                                    options={{
                                        title: 'Article',
                                        statusBarTranslucent: true,
                                    }}
                                />
                            </Stack>
                                
                            </NavThemeProvider>
                        </KeyboardProvider>
                    </GestureHandlerRootView>
                </NDKWalletProvider>
            </NDKProvider>
        </>
    );
}

const SETTINGS_OPTIONS = {
  presentation: 'modal',
  animation: 'fade_from_bottom', // for android
  headerShown: false,
  title: 'Settings',
  headerRight: () => <ThemeToggle />,
} as const;

const LOGIN_OPTIONS = {
  presentation: 'modal',
  headerShown: false,
  animation: 'fade_from_bottom', // for android
} as const;

const RELAYS_OPTIONS = {
  presentation: 'modal',
  title: 'NIP-29 Relays',
} as const;
