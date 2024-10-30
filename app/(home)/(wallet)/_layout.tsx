import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useColorScheme } from '../../../lib/useColorScheme';
export default function RootLayout() {
    const { colors } = useColorScheme();
    
    return (
        <Stack
            screenOptions={{
                animation: 'ios',
                headerShown: true,
                headerTintColor: Platform.OS === 'ios' ? undefined : colors.foreground,
        }}>
            <Stack.Screen name="index" options={{ title: 'Wallet', presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="send" options={{ title: 'Send', presentation: 'modal' }} />
            <Stack.Screen name="receive" options={{ title: 'Receive', presentation: 'modal' }} />

        </Stack>
    );
}
