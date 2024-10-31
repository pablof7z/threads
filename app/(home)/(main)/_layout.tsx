import "@bacons/text-decoder/install";
import "react-native-get-random-values";
import { Icon } from "@roninoss/icons";
import { Stack, Tabs } from "expo-router";

export default function MainLayout() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: 'blue' }}>
                <Tabs.Screen
                    name="index"
                    options={{
                        headerShown: false,
                        title: 'Home',
                        tabBarIcon: ({ color }) => <Icon name="archive-outline" color={color} />
                    }}
                />

                <Tabs.Screen
                    name="publications"
                    options={{
                        headerShown: false,
                        title: 'Publications',
                        tabBarIcon: ({ color }) => <Icon name="archive-outline" color={color} />
                    }}
                />
            </Tabs>
        </>
    )
}