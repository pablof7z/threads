import React, { useEffect, useState } from "react";
import { Button, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, View } from "react-native";
import { useNDK } from "@/ndk-expo";
import { useRouter } from "expo-router";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { withPrivateKey, withPayload, withNip46 } from "@/ndk-expo/providers/ndk/signers";
import { Text } from "@/components/nativewindui/Text";
import { LargeTitleHeader } from "@/components/nativewindui/LargeTitleHeader";
import { colors } from "react-native-keyboard-controller/lib/typescript/components/KeyboardToolbar/colors";
import { useTheme } from "@react-navigation/native";

export default function LoginScreen() {
    const [payload, setPayload] = useState(
        // "nsec1f8j0luh0z2qyz7sd6p4xr9z7yt00wvragscldetd32fhe2yq9lysxg335s"
        "nsec1ffqlrnhhqd35688phhn5uazd3ulf4j753csks73rmrnx6u3myn0su06dxm"
    );
    const { ndk, login, currentUser } = useNDK();
    const router = useRouter();

    const handleLogin = async () => {
        if (!ndk) return;
        try {
            login(withPayload(ndk, payload));
        } catch (error) {
            Alert.alert("Error", error.message || "An error occurred during login");
        }
    };

    const { colors } = useTheme();

    useEffect(() => {
        if (currentUser) router.replace("/")
    }, [ currentUser ])

    const createAccount = async () => {
        const signer = NDKPrivateKeySigner.generate();
        await login(withPrivateKey(signer.privateKey!));

        const payload = nip19.nsecEncode(signer._privateKey!)

        router.replace("/")
    }

    return (
        <View className="flex-1 justify-center items-center bg-card w-full">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View className="h-full w-full flex-1 items-center justify-center">
                    <Text variant="heading" className="text-2xl font-bold">Login</Text>
                    
                    <TextInput
                        style={styles.input}
                        multiline
                        autoCapitalize='none'
                        autoComplete={undefined}
                        placeholder="Enter your nsec or bunker:// connection"
                        autoCorrect={false}
                        value={payload}
                        onChangeText={setPayload}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>

                    <Button onPress={createAccount} title="New to Nostr?" color={colors.primary} />
                    <Button onPress={() => router.replace('/welcome')} title="New to Nostr" color={colors.primary} />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        width: '100%'
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        width: "100%",
        height: 100,
        borderColor: "gray",
        fontFamily: 'monospace',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#007AFF",
        textAlign: "center",
        padding: 20,
        borderRadius: 99,
        marginBottom: 10,
        width: '100%'
    },
    buttonText: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
});
