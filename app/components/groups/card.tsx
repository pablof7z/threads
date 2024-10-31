import { useSubscribe } from '@/ndk-expo';
import AvatarGroup from '@/ndk-expo/components/user/AvatarGroup';
import { NDKArticle, NDKEvent, NDKSimpleGroupMetadata } from '@nostr-dev-kit/ndk';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { Dimensions, Platform, View } from 'react-native';

import { Button } from '~/components/nativewindui/Button';
import {
  addOpacityToRgb,
  Card,
  CardBadge,
  CardContent,
  CardDescription,
  CardFooter,
  CardImage,
  CardSubtitle,
  CardTitle,
} from '~/components/nativewindui/Card';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';

export default function GroupCard({ groupMetadata }: { groupMetadata: NDKSimpleGroupMetadata }) {
    const filters = useMemo(() => [
        { kinds: [9, 10, 11, 12], limit: 20, "#h": [groupMetadata.dTag] },
        { kinds: [30023], limit: 3, "#h": [groupMetadata.dTag] },
    ], [groupMetadata.dTag]);
    const opts = useMemo(() => ({ closeOnEose: false }), []);

    const { events: recentContent} = useSubscribe({filters, opts});

    const articles = useMemo(() => recentContent.filter((event) => event.kind === 30023), [recentContent]);
    const posts = useMemo(() => recentContent.filter((event) => [9, 10, 11, 12].includes(event.kind!)), [recentContent]);
    const pubkeys = useMemo(() => new Set(recentContent.map((event) => event.pubkey)), [recentContent]);
    
    return (
        <View style={{ width: Dimensions.get("screen").width, maxWidth: 300 }}>
            <CardContentSpecific
                image={groupMetadata.picture}
                title={groupMetadata.name}
                subtitle={groupMetadata.about}
                articles={articles}
                posts={posts}
                pubkeys={pubkeys}
            />
        </View>
    );
}

interface CardContentSpecificProps {
    image?: string;
    title?: string;
    subtitle?: string;
    articles: NDKArticle[];
    posts: NDKEvent[];
    pubkeys: Set<string>;
}

const CardContentSpecific: React.FC<CardContentSpecificProps> = ({ image, title, subtitle, articles, posts, pubkeys }) => {
    const uniquedContent = useMemo(() => {
        const seenIds = new Set<string>();
        return articles.filter((content) => {
            if (seenIds.has(content.id)) return false;
            seenIds.add(content.id);
            return true;
        });
    }, [articles]);
  
    return (
        <Card style={{ flex: 1, height: 300 }} className="min-h-[300px]">
            <CardImage
                source={{
                    uri: image,
                }}
            />
            <CardContent
                linearGradientColors={Platform.select({
                    ios: ['transparent', '#0E172488', '#0E1724EE'],
                })}
                className="ios:flex-col-reverse ios:gap-1 gap-1">
                <AvatarGroup events={posts} avatarSize={8} threshold={5} />
                <CardSubtitle numberOfLines={1} className="ios:text-white">{subtitle}</CardSubtitle>
                <CardTitle className="ios:text-white pr-8 text-2xl" numberOfLines={1}>{title}</CardTitle>
            </CardContent>

            {articles.length > 0 && (
                <CardFooter style={Platform.select({ ios: { backgroundColor: '#0E1724EE' } })}>
                    {uniquedContent.slice(0, 1).map(article => (
                        <View className="flex-row items-center gap-4" key={article.id}>
                            {article.image && (
                                <Image
                                    source={{ uri: article.image }}
                                    style={{ width: 44, height: 44, borderRadius: 12 }}
                                />
                            )}
                            <View className="flex-1 pr-4">
                            <Text variant="subhead" numberOfLines={2} className="pr-5 font-semibold ios:text-white">
                                {article.title}
                            </Text>
                            </View>
                        </View>
                    ))}
                </CardFooter>
            )}
        </Card>
    );
};

function CardWithBadge() {
  const { colors } = useColorScheme();
  return (
    <Card
      className="ios:rounded-[0.8rem] min-h-[500px] rounded-[0.6rem]"
      rootClassName="p-1 border border-border/30">
      <CardImage
        source={{
          uri: 'https://cdn.pixabay.com/photo/2023/04/11/18/35/pikachu-7917962_640.jpg',
        }}
        materialRootClassName="rounded-[0.6rem]"
      />
      <CardBadge>
        <Text>Coming soon</Text>
      </CardBadge>

      <CardContent
        linearGradientColors={Platform.select({
          ios: [
            'transparent',
            addOpacityToRgb(colors.card, 0.5),
            addOpacityToRgb(colors.card, 0.9),
            colors.card,
          ],
        })}
        className="ios:flex-col-reverse ios:gap-3 gap-1">
        <CardTitle className=" pr-8">Pre-Order Pokémon TCG Pocket</CardTitle>
        <CardSubtitle className="ios:pt-12">Pre-Order</CardSubtitle>
      </CardContent>

      <CardFooter
        style={Platform.select({
          ios: { backgroundColor: colors.card },
        })}
        className="ios:pt-0">
        <Image
          source={{
            uri: 'https://static.wikia.nocookie.net/pokemongo/images/c/c1/AppIcon_Standard.png/revision/latest?cb=20220304130349',
          }}
          style={{ width: 44, height: 44, borderRadius: 12 }}
        />
        <View className="flex-1 pr-4">
          <Text variant="subhead" className="font-bold">
            Pokémon TCP Pocket
          </Text>
          <CardDescription numberOfLines={1} variant="subhead" className="opacity-70">
            Enjoy Pokémon cards with your friends
          </CardDescription>
        </View>
        <View className="ios:items-center gap-1">
          <Button className="ios:px-6 ios:rounded-full ios:py-0.5">
            <Text>Get</Text>
          </Button>
          <Text variant="caption2" className="text-muted-foreground">
            In-App Purchases
          </Text>
        </View>
      </CardFooter>
    </Card>
  );
}

function CardPlainWithBorder() {
  return (
    <Card rootClassName="shadow-none border border-border">
      <CardContent className="ios:flex-col-reverse ios:gap-3 gap-1">
        <CardTitle className="pr-8">Pre-Order Pokémon TCG Pocket</CardTitle>
        <CardSubtitle>Pre-Order</CardSubtitle>
      </CardContent>
      <CardFooter className="ios:pt-0">
        <CardDescription numberOfLines={1} variant="subhead" className="opacity-70">
          Enjoy Pokémon cards with your friends
        </CardDescription>
      </CardFooter>
    </Card>
  );
}

function CardWithSuggestions() {
  return (
    <Card rootClassName="shadow-none border border-border">
      <View className="ios:h-52 h-64">
        <CardImage
          source={{
            uri: 'https://img.freepik.com/premium-photo/3d-illustration-chat-bubble-with-three-dots-smartphone-screen-phone-is-dark-mode-chat-bubble-is-glowing-blue_1187703-50983.jpg',
          }}
          contentPosition={Platform.select({ ios: 'top right', default: 'center' })}
          materialRootClassName="rounded-[0.6rem] rounded-b-none"
        />
        <CardContent className="ios:flex-col-reverse ios:gap-1.5 ios:flex-1 gap-1">
          <CardTitle className="ios:text-white">Essential Social Apps</CardTitle>
          <CardSubtitle className="ios:text-white">Our Favorites</CardSubtitle>
        </CardContent>
      </View>

      <View className="py-2">
        <CardFooter className="flex-col">
          <View className="flex-row items-center gap-4">
            <Image
              source={{
                uri: 'https://static-00.iconduck.com/assets.00/snapchat-icon-1024x1024-799vt8j6.png',
              }}
              style={{ width: 44, height: 44, borderRadius: 12 }}
            />
            <View className="flex-1 pr-4">
              <Text variant="subhead" className="font-semibold">
                Snapchat
              </Text>
              <CardDescription numberOfLines={2} variant="subhead" className="opacity-70">
                Share the moment
              </CardDescription>
            </View>
            <View className="ios:items-center w-20">
              <Button variant="tonal" className="ios:px-6 ios:rounded-full ios:py-0.5">
                <Text>Get</Text>
              </Button>
            </View>
          </View>
          <View className="flex-row items-center gap-4">
            <Image
              source={{
                uri: 'https://cdn.pixabay.com/photo/2021/06/15/12/28/tiktok-6338429_1280.png',
              }}
              style={{ width: 44, height: 44, borderRadius: 12 }}
            />

            <View className="flex-1 pr-4">
              <Text variant="subhead" className="font-semibold">
                TikTok
              </Text>
              <CardDescription numberOfLines={2} variant="subhead" className="opacity-70">
                Videos, Music & Live Streams
              </CardDescription>
            </View>
            <View className="ios:items-center w-20">
              <Button variant="tonal" className="ios:px-6 ios:rounded-full ios:py-0.5">
                <Text>Get</Text>
              </Button>
            </View>
          </View>
          <View className="flex-row items-center gap-4">
            <Image
              source={{
                uri: 'https://i.pinimg.com/originals/66/1e/cf/661ecf66bda49150b44d25e4440e2bb8.jpg',
              }}
              style={{ width: 44, height: 44, borderRadius: 12 }}
            />
            <View className="flex-1 pr-4">
              <Text variant="subhead" className="pr-5 font-semibold">
                Discord - Talk, Play, Hang Out
              </Text>
              <CardDescription numberOfLines={1} variant="subhead" className="opacity-70">
                Group Chat That's fun and easy
              </CardDescription>
            </View>
            <View className="ios:items-center w-20">
              <Button variant="tonal" className="ios:px-4 ios:rounded-full ios:py-0.5">
                <Text>Open</Text>
              </Button>
            </View>
          </View>
        </CardFooter>
      </View>
    </Card>
  );
}
