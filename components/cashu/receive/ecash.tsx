import "react-native-get-random-values";
import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'; // Update imports
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';
import { ClipboardPasteButton } from 'expo-clipboard'; // Add this import
import { useState } from 'react'; // Add useState import
import { Text } from '@/components/nativewindui/Text';
import { useNDKWallet } from '@/ndk-expo/providers/wallet';
import { router, Stack } from 'expo-router';
import Drawer from 'expo-router/drawer';
import { NDKCashuWallet } from '@nostr-dev-kit/ndk-wallet';

export default function ReceiveEcash({ onReceived }: { onReceived: () => void }) {
    const [permission, requestPermission] = useCameraPermissions();
    const { defaultWallet } = useNDKWallet();

    if (!permission) {
        return <View />; // Loading state
    }
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    async function receive(token: string) {
        if (!defaultWallet) {
            return;
        }

        console.log('receive', token);
        console.log('crypto', crypto);

        (defaultWallet as NDKCashuWallet).receiveToken(token)
            .then((result) => {
                console.trace(result);
                onReceived();
            })
            .catch((error) => {
                console.trace(error);
            });
    }

    const handleQRCodeScanned = (data: string) => {
        console.log('QR code scanned', data);
        receive(data); // Call send function with scanned data
    };

    return (
        <View style={styles.container}>
            <Drawer.Screen options={{ title: 'Send' }} />
            <CameraView 
                 barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                style={styles.camera} 
                onBarcodeScanned={({ data }) => handleQRCodeScanned(data)} // Add QR code scan handler
            >
                <View style={styles.buttonContainer} />
            </CameraView>
            {Clipboard.isPasteButtonAvailable && (
                <View style={styles.buttonContainer}>
                  <ClipboardPasteButton 
                      style={[styles.buttonPaste, { width: '100%', height: 50 }]} 
                      onPress={(a) => {
                          if (a.text) receive(a.text)
                      }}
                      displayMode="iconAndLabel" 
                  />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    message: {
      textAlign: 'center',
      paddingBottom: 10,
    },
    camera: {
      flex: 1,
      maxHeight: '50%',
    },
    buttonContainer: {
      flexDirection: 'row',
      backgroundColor: 'transparent',
      margin: 20,
    },
    button: {
      flex: 1,
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    buttonPaste: {
        alignItems: 'center',
        margin: 10,
    },
  });
