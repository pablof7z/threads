import React, { useEffect, useCallback, useState } from "react";
import { StyleSheet, TouchableOpacity, Alert, ScrollView, View } from "react-native";
import { useNDKWallet } from "@/ndk-expo/providers/wallet";
import { useRouter } from "expo-router";
import WalletView from "./WalletView";
import { useNDK } from "@/ndk-expo";
import { Text } from "@/components/nativewindui/Text";

export default function WalletScreen() {
    const { currentUser } = useNDK();
    const { wallets, defaultWallet } = useNDKWallet();
    const router = useRouter();

    const setWalletParams = useCallback(
        (walletName: string) => {
            router.setParams({ walletName });
        },
        [router]
    );

    useEffect(() => {
        if (defaultWallet) {
            setWalletParams(defaultWallet.name);
        }
    }, [defaultWallet, setWalletParams]);

    useEffect(() => {
        if (!currentUser) {
            router.back();
            router.push({
                pathname: '/login',
            });
        }
    }, [currentUser, router]);

    if (!currentUser) {
        return null;
    }

    function handleSend() {
        router.push({
            pathname: '/wallet/send',
        });
    }

    const handleReceive = () => {
        router.push({
            pathname: '/wallet/receive',
        });
    };

    return (
        <View style={styles.container}>
            {defaultWallet ? (
                <WalletView
                    wallet={defaultWallet}
                    onSend={handleSend}
                    onReceive={handleReceive} // Added onReceive prop
                />
            ) : (
                <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/wallet/new' })}>
                    <Text style={styles.buttonText}>Create New Wallet</Text>
                </TouchableOpacity>
            )}
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 20,
    },
    walletContainer: {
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#007AFF",
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
