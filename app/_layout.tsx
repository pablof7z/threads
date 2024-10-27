import '../global.css';
import 'expo-dev-client';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { NDKCacheAdapterSqlite } from "@/ndk-expo";
import { Icon } from '@roninoss/icons';
import { Link, Stack, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';  
import { Platform, Pressable, View } from 'react-native';
import * as User from '@/ndk-expo/components/user';

import { ThemeToggle } from '~/components/ThemeToggle';
import { cn } from '~/lib/cn';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import { NDKProvider, useNDK } from '~/ndk-expo';
import { NDKWalletProvider } from '@/ndk-expo/providers/wallet';

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
                explicitRelayUrls={['ws://localhost:2929', 'wss://relays.groups.nip29.com', 'wss://relay.0xchat.com', 'wss://relay.primal.net', 'wss:/purplepag.es', 'wss://f7z.io', 'wss://relay.damus.io', 'wss://relay.nostr.watch']}
                cacheAdapter={new NDKCacheAdapterSqlite("nutsack")}
            >
                <NDKWalletProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
                            <NavThemeProvider value={NAV_THEME[colorScheme]}>
                            <Stack
                                screenOptions={{
                                    headerShown: true,
                                    headerTintColor: Platform.OS === 'ios' ? undefined : colors.foreground,
                            }}>
                                <Stack.Screen name="auth/login" options={LOGIN_OPTIONS} />
                                <Stack.Screen name="(home)/index" options={{
                                    headerShown: false,
                                }} />
                                <Stack.Screen name="relays" options={RELAYS_OPTIONS} />
                                <Stack.Screen name="settings" options={SETTINGS_OPTIONS} />
                            </Stack>
                                
                            </NavThemeProvider>
                        </KeyboardProvider>
                    </GestureHandlerRootView>
                </NDKWalletProvider>
            </NDKProvider>
        </>
    );
}

const SCREEN_OPTIONS = {
  animation: 'ios', // for android
} as const;



const SETTINGS_OPTIONS = {
  presentation: 'modal',
  animation: 'fade_from_bottom', // for android
  title: 'Settings',
  headerRight: () => <ThemeToggle />,
} as const;

const LOGIN_OPTIONS = {
  presentation: 'modal',
  title: 'Login',
  animation: 'fade_from_bottom', // for android
} as const;

const RELAYS_OPTIONS = {
  presentation: 'modal',
  title: 'NIP-29 Relays',
} as const;
