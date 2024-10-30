import { Text } from "@/components/nativewindui/Text";
import { useSubscribe } from "@/ndk-expo";
import { NDKArticle } from "@nostr-dev-kit/ndk";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import Article from "@/components/events/article";
import { useIsFocused } from '@react-navigation/native';
import { useStore } from 'zustand';
import { articleStore } from "./stores";

export default function ArticleView() {
    let article = useStore(articleStore).activeArticle;
    
    // const { eventId } = useLocalSearchParams();
    // const filters = useMemo(() => [
    //     { ids: [eventId] }
    // ], [eventId]);
    // const opts = useMemo(() => ({
    //     closeOnEose: true,
    //     klass: NDKArticle
    // }), []);
    // const { events: articles } = useSubscribe<NDKArticle>({ filters, opts });
    // const article = articles[0];

    if (!article) return <Text>Article not found</Text>;

    return (
        <Article article={article} />
    )
}
