import { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet";
import { View, StyleSheet } from "react-native";
import Balance from "./balance";
import Buttons from "./buttons";
import Views from "./views";

interface WalletProps {
    wallet: NDKCashuWallet;
}



export default function Wallet({ wallet }: WalletProps) {
    return (
        <View style={styles.container}>
            <Balance wallet={wallet} />

            <Buttons wallet={wallet} />

            <Views wallet={wallet} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})