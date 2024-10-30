import { Text } from "@/components/nativewindui/Text";
import { useSubscribe } from "@/ndk-expo";
import { NDKArticle } from "@nostr-dev-kit/ndk";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import Article from "@/components/events/article";
import { Toolbar } from "@/components/nativewindui/Toolbar";

export default function ArticleView() {
    const { eventId } = useLocalSearchParams();
    const filters = useMemo(() => [
        { ids: [eventId] }
    ], [eventId]);
    const opts = useMemo(() => ({
        klass: NDKArticle
    }), []);
    const { events: articles } = useSubscribe<NDKArticle>({ filters, opts });
    const article = articles[0];

    if (!article) return <Text>Article not found</Text>;

    return (
        <Article article={article} />
    )
}
