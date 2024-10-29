import { useState, useRef } from 'react';
import { Button, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SegmentedControl } from '~/components/nativewindui/SegmentedControl';
import ReceiveLn from '@/components/cashu/receive/ln';
import ReceiveEcash from '@/components/cashu/receive/ecash';
import { router } from 'expo-router';

function ReceiveView() {
    const [view, setView] = useState<'ecash' | 'ln'>('ecash');

    const onReceived = () => {
        router.back();
    }

    return (
        <View style={{ flex: 1 }}>
            <SegmentedControl
                values={['Lightning', 'Ecash']}
                selectedIndex={view === 'ln' ? 0 : 1}
                onIndexChange={(index) => {
                    setView(index === 0 ? 'ln' : 'ecash');
                }}
            />
            
            {view === 'ln' ? (
                <ReceiveLn />
             ) : (
                <ReceiveEcash onReceived={onReceived} />
             )}
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        fontSize: 10,
        width: 0,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
    amount: {
        fontSize: 72,
        marginTop: 10,
        width: '100%',
        textAlign: 'center',
        fontWeight: '900',
        backgroundColor: 'transparent',
    },
    mint: {
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 8,
        fontWeight: 'bold',
    },
    selectedMint: {
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 8,
        fontWeight: 'bold',
    },
    mintContainer: {
        // Add styles for the container if needed
    },
    selectedMintText: {
        // Add styles for the selected text if needed
    },
    unit: {
        fontSize: 24, // Adjusted font size for smaller display
        width: '100%',
        textAlign: 'center',
        fontWeight: '400', // Optional: adjust weight if needed
        backgroundColor: 'transparent',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    continueButton: {
        backgroundColor: '#007BFF', // Button background color
        padding: 20, // Padding for the button
        borderRadius: 5, // Rounded corners
        alignItems: 'center', // Center the text
        marginTop: 20, // Space above the button
        width: '60%', // Set a narrower width for the button
        alignSelf: 'center', // Center the button horizontally
    },
    continueButtonText: {
        color: '#FFFFFF', // Text color
        fontSize: 16, // Font size
        fontWeight: 'bold', // Bold text
    },
    qrCodeContainer: {
        alignItems: 'center', // Center-aligns the QR code
        justifyContent: 'center', // Center vertically
    },
});

export default ReceiveView;