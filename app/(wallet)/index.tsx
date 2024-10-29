import React, { useEffect, useCallback, useState } from "react";
import { StyleSheet, TouchableOpacity, Alert, ScrollView, View } from "react-native";
import { useNDKWallet } from "@/ndk-expo/providers/wallet";
import { Stack, useRouter } from "expo-router";
import { useNDK } from "@/ndk-expo";
import { Text } from "@/components/nativewindui/Text";
import { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet";
import Wallet from "@/components/wallet";
import { SafeAreaFrameContext, SafeAreaView } from "react-native-safe-area-context";

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
            // router.back();
        }
    }, [currentUser, router]);

    if (!currentUser) {
        return null;
    }

    return (
        <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-card">
            <View style={styles.container} className='bg-card'>
                {defaultWallet ? (
                <Wallet
                    wallet={defaultWallet as NDKCashuWallet}
                />
            ) : (
                <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/new-wallet' })}>
                    <Text style={styles.buttonText}>Create New Wallet</Text>
                </TouchableOpacity>
            )}
            
            </View>
        </SafeAreaView>
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
    
});
