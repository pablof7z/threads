import { LargeTitleHeader } from "@/components/nativewindui/LargeTitleHeader";
import { ScrollView } from "react-native-gesture-handler";

export default function PublicationsScreen() {
    return (
        <ScrollView>
            <LargeTitleHeader title="Settings" searchBar={{ iosHideWhenScrolling: true }} />
        </ScrollView>
    )
}