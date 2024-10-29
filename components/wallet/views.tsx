import { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet";
import { View } from "react-native";
import { SegmentedControl } from "../nativewindui/SegmentedControl/SegmentedControl";
import { useState } from "react";
import History from "./history";
import Mints from "./mints";
import Tokens from "./tokens";
import { Text } from "../nativewindui/Text";
const TABS = ['History', 'Mints', 'Tokens'];

interface ViewsProps {
    wallet: NDKCashuWallet;
};  

export default function Views({ wallet }: ViewsProps) {
    const [activeTab, setActiveTab] = useState<number>(0);
    
    return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={{ marginVertical: 10 }}>
                <SegmentedControl
                    values={TABS}
                    selectedIndex={activeTab}
                    onIndexChange={(index) => {
                        setActiveTab(index);
                    }}
                />
            </View>

            {activeTab === 0 && <History wallet={wallet} />}
            {activeTab === 1 && <Mints wallet={wallet} />}
            {activeTab === 2 && <Tokens wallet={wallet} />}
        </View>
    )
}