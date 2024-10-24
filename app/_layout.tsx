import '../global.css';
import 'expo-dev-client';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { NDKCacheAdapterSqlite } from "@/ndk-expo";
import { Icon } from '@roninoss/icons';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';  
import { Pressable, View } from 'react-native';
import * as User from '@/ndk-expo/components/user';

import { ThemeToggle } from '~/components/ThemeToggle';
import { cn } from '~/lib/cn';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import { NDKProvider, useNDK } from '~/ndk-expo';
import { Text } from '@/components/nativewindui/Text';

export {
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
    useInitialAndroidBarSync();
    const { colorScheme, isDarkColorScheme } = useColorScheme();

    return (
        <>
            <StatusBar
                key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
                style={isDarkColorScheme ? 'light' : 'dark'}
            />
            <NDKProvider
                explicitRelayUrls={['ws://localhost:2929', 'wss://relays.groups.nip29.com', 'wss://relay.primal.net', 'wss:/purplepag.es', 'wss://f7z.io', 'wss://relay.damus.io', 'wss://relay.nostr.watch']}
                cacheAdapter={new NDKCacheAdapterSqlite("nutsack")}
            >
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
                        <NavThemeProvider value={NAV_THEME[colorScheme]}>
                            <Stack screenOptions={SCREEN_OPTIONS}>
                            <Stack.Screen name="index" options={INDEX_OPTIONS} />
                            <Stack.Screen name="modal" options={MODAL_OPTIONS} />
                            <Stack.Screen name="login" options={LOGIN_OPTIONS} />
                            <Stack.Screen name="relays" options={RELAYS_OPTIONS} />
                            </Stack>
                        </NavThemeProvider>
                    </KeyboardProvider>
                </GestureHandlerRootView>
            </NDKProvider>
        </>
    );
}

const SCREEN_OPTIONS = {
  animation: 'ios', // for android
} as const;

const INDEX_OPTIONS = {
  headerLargeTitle: false,
  headerTitle: () => (
    <Link href="/relays" asChild>
      <Pressable className="opacity-80">
        {({ pressed }) => (
          <View className={cn(pressed ? 'opacity-50' : 'opacity-90')}>
            <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>
              Threads
            </Text>
          </View>
        )}
      </Pressable>
    </Link>
  ),
  headerLeft: () => <UserIcon />,
  headerRight: () => <SettingsIcon />,
} as const;

function UserIcon() {
  const { colors } = useColorScheme();
  const { currentUser } = useNDK();

  if (currentUser) {
    return (
      <Link href="/" asChild>
        <Pressable className="opacity-80">
          {({ pressed }) => (
            <User.Profile pubkey={currentUser.pubkey}>
              <View className={cn(pressed ? 'opacity-50' : 'opacity-90')}>
                <User.Avatar style={{ width: 24, height: 24 }} />
              </View>
            </User.Profile>
          )}
        </Pressable>
      </Link>
    );
  }
  
  return (
    <Link href="/(drawer)/" asChild>
      <Pressable className="opacity-80">
        {({ pressed }) => (
          <View className={cn(pressed ? 'opacity-50' : 'opacity-90')}>
            <Icon name="account-circle-outline" size={24} color={colors.foreground} />
          </View>
        )}
      </Pressable>
    </Link>
  );
}

function SettingsIcon() {
  const { colors } = useColorScheme();
  return (
    <Link href="/modal" asChild>
      <Pressable className="opacity-80">
        {({ pressed }) => (
          <View className={cn(pressed ? 'opacity-50' : 'opacity-90')}>
            <Icon name="cog-outline" color={colors.foreground} />
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const MODAL_OPTIONS = {
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
