import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';

interface ComposerProps {
    textInputHeight: SharedValue<number>;
    setMessages: (message: string) => void;
}

const Composer: React.FC<ComposerProps> = ({ textInputHeight, setMessages }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim()) {
            setMessages(text);
            setText('');
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.inputContainer, { height: textInputHeight.value }]}>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    placeholder="Type a message"
                    multiline
                />
            </Animated.View>
            <Button title="Send" onPress={handleSend} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    inputContainer: {
        flex: 1,
        marginRight: 8,
        borderRadius: 4,
        backgroundColor: '#f0f0f0',
    },
    input: {
        padding: 8,
        fontSize: 16,
    },
});

export default Composer;
