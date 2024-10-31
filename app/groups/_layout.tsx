import { Icon } from "@roninoss/icons";
import { Stack, Tabs } from "expo-router";

export default function GroupLayout() {
    return (
        <>
            <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
                <Tabs.Screen
                    name="index"
                    options={{
                        headerShown: false,
                        title: 'Home',
                        tabBarIcon: ({ color }) => <Icon size={28} name="home" color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="chat"
                    options={{
                        headerShown: false,
                        title: 'Chat',
                        tabBarIcon: ({ color }) => <Icon size={28} name="message-outline" color={color} />,
                    }}
                />
            </Tabs>
        </>
    )
}