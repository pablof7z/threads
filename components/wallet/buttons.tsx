import { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@/components/nativewindui/Text";
import { router } from "expo-router";
import { Icon } from "@roninoss/icons";
import { useCallback } from "react";

interface ButtonsProps {
    wallet: NDKCashuWallet;
}

export default function Buttons({ wallet }: ButtonsProps) {
    const handleSend = () => router.push({
        pathname: '/(wallet)/send'
    });

    const handleReceive = () => router.push({
        pathname: '/(wallet)/receive'
    });

    const handleSync = useCallback(() => {
        if (wallet) {
            wallet.checkProofs();
        }
    }, [wallet]);
    
    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleSend}>
                <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSync}>
                <Text>
                    <Icon name="map" />
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleReceive}>
                <Text style={styles.buttonText}>Receive</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 16,
        gap: 10,
    },
    button: {
        backgroundColor: "black",
        flex: 1,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});