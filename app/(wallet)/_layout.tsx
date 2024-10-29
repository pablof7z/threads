import { Link, router, Stack } from "expo-router";
import { Platform, Pressable, View } from "react-native";
import { useColorScheme } from "../../lib/useColorScheme";
import { Icon } from "@roninoss/icons";
import { cn } from "@/lib/cn";
import { Text } from "@/components/nativewindui/Text";
import { BackButton } from "@/components/BackButton";

function SettingsIcon() {
    const { colors } = useColorScheme();
    return (
      <Link href="/settings" asChild>
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

export default function RootLayout() {
    const { colors } = useColorScheme();
    
    return (
        <Stack
            screenOptions={{
                animation: 'ios',
                headerShown: true,
                headerTintColor: Platform.OS === 'ios' ? undefined : colors.foreground,
                headerRight: () => <SettingsIcon />,
        }}>
            <Stack.Screen name="index" options={{
                headerShown: false,
                headerTitle: () => <Text>Wallet2</Text>,
                headerRight: () => <SettingsIcon />,
            }} />
            <Stack.Screen name="send" options={{ title: 'Send', presentation: 'modal' }} />
            <Stack.Screen name="receive" options={{ title: 'Receive', presentation: 'modal' }} />
        </Stack>
    );
}
