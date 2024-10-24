import React, { useEffect, useState } from "react";
import { Button, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useNDK } from "@/ndk-expo";
import { useRouter } from "expo-router";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { withPrivateKey } from "@/ndk-expo/providers/ndk/signers";
import { Text } from "@/components/nativewindui/Text";

export default function LoginScreen() {
    const [nsec, setNsec] = useState(
        "nsec1f8j0luh0z2qyz7sd6p4xr9z7yt00wvragscldetd32fhe2yq9lysxg335s"
    );
    const { login, currentUser } = useNDK();
    const router = useRouter();

    const handleLogin = async () => {
        try {
            login(withPrivateKey(nsec));
        } catch (error) {
            Alert.alert("Error", error.message || "An error occurred during login");
        }
    };

    useEffect(() => {
        if (currentUser) router.replace("/")
    }, [ currentUser ])

    const createAccount = async () => {
        const signer = NDKPrivateKeySigner.generate();
        await login(withPrivateKey(signer.privateKey!));

        const nsec = nip19.nsecEncode(signer._privateKey!)

        router.replace("/")
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
                <Text style={styles.title}>Login to Nutsack</Text>
            <TextInput
                style={styles.input}
                multiline
                placeholder="Enter your nsec"
                value={nsec}
                onChangeText={setNsec}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <Button onPress={createAccount} title="Create new account" />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
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
    },
    buttonText: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
});
