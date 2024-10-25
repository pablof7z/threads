import "@bacons/text-decoder/install";
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Icon } from '@roninoss/icons';
import { Link, Stack, useNavigation } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Platform, Pressable, View } from 'react-native';
import * as User from '@/ndk-expo/components/user';

import { Text } from '~/components/nativewindui/Text';
import {
  DrawerContentRoot,
  DrawerContentSection,
  DrawerContentSectionItem,
  DrawerContentSectionTitle,
  getActiveDrawerContentScreen,
} from '~/components/nativewindui/DrawerContent';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from "@/lib/cn";
import { useNDK } from "@/ndk-expo";

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
  const navigation = useNavigation();

  if (currentUser) {
    return (
        <Pressable className="opacity-80" onPress={() => navigation.toggleDrawer()}>
          {({ pressed }) => (
            <User.Profile pubkey={currentUser.pubkey}>
              <View className={cn(pressed ? 'opacity-50' : 'opacity-90')}>
                <User.Avatar style={{ width: 24, height: 24 }} />
              </View>
            </User.Profile>
          )}
        </Pressable>
    );
  }
  
  return (
    <Link href="/login" asChild>
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
    <Link href="/settings" asChild>
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

export default function DrawerLayout() {
  const { colors } = useColorScheme();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Drawer
        drawerContent={DrawerContent}
        screenOptions={INDEX_OPTIONS}
      >
        <Drawer.Screen name="index" options={{ title: 'Threads' }} />
        <Drawer.Screen name="wallet" options={{ title: 'Wallet' }} />
      </Drawer>
    </>
  );
}

export function DrawerContent(props: DrawerContentComponentProps) {
  const { colors } = useColorScheme();

  const activeScreen = getActiveDrawerContentScreen(props);

  return (
    <DrawerContentRoot
      actions={
        <Pressable>
          {/* <Icon
            ios={{ name: 'ellipsis.circle', weight: 'light' }}
            materialIcon={{
              name: 'dots-horizontal-circle-outline',
              type: 'MaterialCommunityIcons',
            }}
            color={Platform.select({ default: colors.grey, ios: colors.primary })}
          /> */}
        </Pressable>
      }>
      <DrawerContentSectionTitle type="large">Threads</DrawerContentSectionTitle>
      <DrawerContentSection>
        <Link href="/(home)" asChild>
          <DrawerContentSectionItem
            icon={{ name: 'home' }}
            isActive={activeScreen === 'index'}
            label="Threads"
            rightView={<Text className="px-1 text-sm">1</Text>}
          />
        </Link>
        <Link href="/(home)/wallet" asChild>
          <DrawerContentSectionItem
            icon={{ name: 'lightning-bolt' }}
            isActive={activeScreen === 'wallet'}
            label="Wallet"
          />
        </Link>
        <Link href="/schedule" asChild>
          <DrawerContentSectionItem
            icon={{ name: 'alarm' }}
            isActive={activeScreen === 'schedule'}
            label="Schedule"
          />
        </Link>
      </DrawerContentSection>
      {/* {Platform.OS === 'android' && <View className="bg-border mx-3.5 my-1 h-px" />}
      <DrawerContentSectionTitle>Library</DrawerContentSectionTitle>
      <DrawerContentSection>
        <DrawerContentSectionItem
          icon={{ name: 'microphone-variant' }}
          isActive={false}
          label="Artists"
        />
        <DrawerContentSectionItem icon={{ name: 'music-note' }} isActive={false} label="Songs" />
        <DrawerContentSectionItem icon={{ name: 'monitor' }} isActive={false} label="TV & Movies" />
      </DrawerContentSection> */}
    </DrawerContentRoot>
  );
}