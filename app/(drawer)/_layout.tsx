import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Icon } from '@roninoss/icons';
import { Stack } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Platform, Pressable, View } from 'react-native';

import { Text } from '~/components/nativewindui/Text';
import {
  DrawerContentRoot,
  DrawerContentSection,
  DrawerContentSectionItem,
  DrawerContentSectionTitle,
  getActiveDrawerContentScreen,
} from '~/components/nativewindui/DrawerContent';
import { useColorScheme } from '~/lib/useColorScheme';

export default function DrawerLayout() {
  const { colors } = useColorScheme();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Drawer
        drawerContent={DrawerContent}
        screenOptions={{
          headerShown: true,
          swipeEnabled: true,
          headerTintColor: Platform.OS === 'ios' ? undefined : colors.foreground,
        }}>
        <Drawer.Screen
          name="index"
          options={{
            title: 'Drawer',
          }}
        />
      </Drawer>
    </>
  );
}

function DrawerContent(props: DrawerContentComponentProps) {
  const { colors } = useColorScheme();

  const activeScreen = getActiveDrawerContentScreen(props);

  return (
    <DrawerContentRoot
      actions={
        <Pressable>
          <Icon
            ios={{ name: 'ellipsis.circle', weight: 'light' }}
            materialIcon={{
              name: 'dots-horizontal-circle-outline',
              type: 'MaterialCommunityIcons',
            }}
            color={Platform.select({ default: colors.grey, ios: colors.primary })}
          />
        </Pressable>
      }>
      <DrawerContentSectionTitle type="large">Music</DrawerContentSectionTitle>
      <DrawerContentSection>
        <DrawerContentSectionItem
          icon={{ name: 'play-circle-outline' }}
          isActive={activeScreen === 'index'}
          label="Listen Now"
          rightView={<Text className="px-1 text-sm">1</Text>}
        />
        <DrawerContentSectionItem icon={{ name: 'atom' }} isActive={false} label="React Native" />
        <DrawerContentSectionItem icon={{ name: 'alarm' }} isActive={false} label="Clock" />
      </DrawerContentSection>
      {Platform.OS === 'android' && <View className="bg-border mx-3.5 my-1 h-px" />}
      <DrawerContentSectionTitle>Library</DrawerContentSectionTitle>
      <DrawerContentSection>
        <DrawerContentSectionItem
          icon={{ name: 'microphone-variant' }}
          isActive={false}
          label="Artists"
        />
        <DrawerContentSectionItem icon={{ name: 'music-note' }} isActive={false} label="Songs" />
        <DrawerContentSectionItem icon={{ name: 'monitor' }} isActive={false} label="TV & Movies" />
      </DrawerContentSection>
    </DrawerContentRoot>
  );
}
