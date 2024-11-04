import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { Icon, IconProps } from '@roninoss/icons';
import { useNavigation } from 'expo-router';
import * as React from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';
import { COLORS } from '~/theme/colors';

const ANDROID_ACTION_BAR_HEIGHT = 60;

type DrawerContentRootProps = React.ComponentPropsWithoutRef<typeof View> & {
  actions?: React.ReactNode;
};
function DrawerContentRoot({ actions, children, className, ...props }: DrawerContentRootProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useColorScheme();
  const toggleDrawer = useToggleDrawer();

  return (
    <View className={cn('flex-1', className)} {...props}>
      {Platform.OS === 'ios' ? (
        <View
          style={{ paddingTop: insets.top }}
          className="flex-row items-center justify-between px-4 pb-1.5">
          <Pressable className="active:opacity-70" onPress={toggleDrawer}>
            <Icon
              name="close"
              ios={{ name: 'sidebar.leading', weight: 'light' }}
              color={colors.primary}
            />
          </Pressable>
          {actions}
        </View>
      ) : (
        <View style={{ height: insets.top }} />
      )}
      <ScrollView
        contentContainerStyle={{
          paddingBottom:
            insets.bottom + (Platform.OS !== 'ios' && !!actions ? ANDROID_ACTION_BAR_HEIGHT : 0),
        }}>
        {children}
      </ScrollView>
      {Platform.OS === 'android' && !!actions && (
        <View
          style={{ height: insets.bottom + ANDROID_ACTION_BAR_HEIGHT }}
          className="bg-card px-4 pt-1">
          <View className="flex-row items-center justify-between p-3.5">{actions}</View>
        </View>
      )}
    </View>
  );
}

function DrawerContentSectionTitle({
  type = 'default',
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Text> & {
  type?: 'large' | 'default';
}) {
  return (
    <Text
      variant={Platform.OS === 'ios' ? (type === 'large' ? 'largeTitle' : 'title3') : 'footnote'}
      className={cn(
        'ios:font-bold ios:px-4  text-card-foreground px-6  pb-2.5 pt-4 font-medium',
        className
      )}
      {...props}
    />
  );
}

function DrawerContentSection({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof View>) {
  return <View className={cn('gap-1 px-2', className)} {...props} />;
}

function DrawerContentSectionItem<T extends 'sfSymbol' | 'material'>({
  label,
  icon,
  onPress,
  isActive,
  rightView,
}: {
  label: string;
  icon: IconProps<T>;
  onPress?: () => void;
  isActive?: boolean;
  rightView?: React.ReactNode;
}) {
  const { colors } = useColorScheme();
  return (
    <Button
      variant={isActive ? Platform.select({ default: 'tonal', ios: 'primary' }) : 'plain'}
      onPress={onPress}
      className="ios:gap-2 ios:px-2 justify-start gap-3 rounded-lg px-4 py-3.5">
      <Icon
        color={
          isActive
            ? Platform.select({ default: colors.foreground, ios: COLORS.white })
            : Platform.select({ default: colors.grey, ios: colors.primary })
        }
        {...icon}
      />
      <View className="flex-1">
        <Text
          className={cn(
            isActive ? 'ios:text-white dark:text-white' : 'text-card-foreground',
            'android:text-[14px] font-normal'
          )}>
          {label}
        </Text>
      </View>
      {rightView}
    </Button>
  );
}

function useToggleDrawer() {
  const navigation = useNavigation();

  return () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };
}

function getActiveDrawerContentScreen(props: DrawerContentComponentProps) {
  return props.state.routes[props.state.index].name;
}

export {
  DrawerContentRoot,
  DrawerContentSection,
  DrawerContentSectionItem,
  DrawerContentSectionTitle,
  useToggleDrawer,
  getActiveDrawerContentScreen,
};