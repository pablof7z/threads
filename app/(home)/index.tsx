import { router } from 'expo-router';
import * as React from 'react';
import { renderItem } from '@/components/lists/items';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { NDKEvent, NDKSimpleGroupMetadata, NDKEventId, NDKKind, NDKArticle } from '@nostr-dev-kit/ndk';
import { Thread } from '@/components/lists/items/thread';
import { useGroupMetadata } from '../hooks/useGroups';
import { useThreads } from '../hooks/useThreads';
import GroupCard from '../components/groups/card';
import { List } from '@/components/nativewindui/List';
import { Dimensions, GestureResponderEvent, SafeAreaView, StyleSheet, Touchable, View } from 'react-native';
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
import { Text } from '@/components/nativewindui/Text';
import { Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as User from '@/ndk-expo/components/user';
import { withPayload } from '@/ndk-expo/providers/ndk/signers';
import { useNDK, useSubscribe } from '@/ndk-expo';
import { useNDKSession } from '@/ndk-expo/hooks/session';
import { LargeTitleHeader } from '@/components/nativewindui/LargeTitleHeader';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import Swipeable from '@/components/ui/Swipable';
import Article from '@/components/events/article';
import { articleStore } from '../stores';
import { useStore } from 'zustand';
import { LinearGradient } from 'expo-linear-gradient';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});



async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}


function handleRegistrationError(errorMessage: string) {
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

function Notification() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { ndk, login } = useNDK();

  useEffect(() => {
    if (!ndk) return;

    login(withPayload(ndk, "nsec1f8j0luh0z2qyz7sd6p4xr9z7yt00wvragscldetd32fhe2yq9lysxg335s"));
  }, [ndk])

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text style={{ fontFamily: 'monospace' }}>{expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      />
    </View>
  );
}


export default function ConversationsIosScreen() {
    // const groupItems = useGroupMetadata();
    // const threads = useThreads();
    // const lists = useLists();

    const handleGroupPress = (group: NDKSimpleGroupMetadata) => {
        const groupId = group.dTag;
        router.push(`/groups/home?groupId=${groupId}`);
    };

    const handleMessagePress = (thread: Thread) => {
        router.push(`/messages/thread?eventId=${thread.rootEventId}`);
    };

    // const renderItemFn = renderItem(handleMessagePress, handleGroupPress);

    // const listItems = useMemo(() => [...threads, ...groupItems], [threads, groupItems]);

    // const featuredGroups = useMemo(() => groupItems
    //     .filter((group) => group.name && group.picture)
    //     .slice(0, 10)
    // , [groupItems]);

    return (
        <View className="flex-1 items-stretch justify-stretch">
            <ArticleList />
            {/* <ScrollView 
                horizontal={true} // Enable horizontal scrolling
                stickyHeaderHiddenOnScroll
                showsHorizontalScrollIndicator={false}
                style={{ height: 320, flexGrow: 0 }}
            >
                {featuredGroups.map((item, index) => (
                    <View style={{ paddingHorizontal: 5, paddingVertical: 10 }}>
                        <GroupCard groupMetadata={item} />
                    </View>
                ))}
            </ScrollView>
            <List
                data={listItems}
                // data={groupItems}
                contentInsetAdjustmentBehavior="automatic"
                estimatedItemSize={88}
                keyExtractor={(item: Thread | NDKSimpleGroupMetadata) => item.id}
                renderItem={renderItemFn}
            /> */}
        </View>
    );
}

function ArticleItem({ article }: { article: NDKArticle }) {
    return <Text>{article.title}</Text>;
}

const ArticleList = () => {
    const { follows } = useNDKSession();
    const filters = useMemo(() => [
        { kinds: [NDKKind.Article], limit: 50 }
    ], [follows]);
    const opts = useMemo(() => {
        return { klass: NDKArticle };
    }, []);

    const {events: articles} = useSubscribe<NDKArticle>({filters, opts});

    const store = useStore(articleStore);

    if (articles.length === 0) return <Text>No articles</Text>;


    return (
        <View className="flex-1 items-stretch justify-stretch h-full w-full">
            <FlashList
                data={articles}
                keyExtractor={(item) => item.id}
                estimatedItemSize={500}
                renderItem={(item) => {
                    const article = item.item;
                    
                    return (
                        <TouchableHighlight onPress={() => {
                            store.setArticle(article)
                            router.push(`/article`);
                        }}>
                            
                            {(item.index === 0) ? (
                                <FeaturedArticleCard article={item.item} />
                            ) : (
                                <ArticleCard3 article={item.item} />
                            )}
                        </TouchableHighlight>
                    )
                }}
            />
        </View>
    )
}

interface ArticleCardProps {
    article: NDKArticle;
}

function FeaturedArticleCard({ article }: ArticleCardProps) {
    return (
        <View className="relative" style={{ height: Dimensions.get('window').height*0.5 }}>
                <Image source={article.image} className="w-full h-full flex-1" style={{ objectFit: 'cover', height: '100%', maxWidth: '100%' }} />
                
            <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,1)']}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%' }}
            />
            
            <View style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
                <Text numberOfLines={2} variant="heading" className="text-3xl font-bold text-white font-serif">{article.title}</Text>

                <View className="flex-row items-center gap-4 py-2">
                    <User.Profile pubkey={article.pubkey}>
                        <User.Avatar className="w-8 h-8" />

                        <View className="flex-1 flex-col items-start">
                            <Text variant="subhead" className="text-white"><User.Name /></Text>
                        </View>
                    </User.Profile>
                </View>
            </View>
        </View>
    );
}

function ArticleCard3({ article }: ArticleCardProps) {
    return (
            <View style={styles.container}>
                <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
                <Text style={styles.meta}>
                    <User.Profile pubkey={article.pubkey}>
                        <User.Name />
                    </User.Profile>
                    • 4 min read
                </Text>
                <Text style={styles.summary} numberOfLines={2}>{article.summary}</Text>
                </View>
                <Image source={article.image} style={styles.image} />
            </View>
    );
}
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: '#f9f9f9',
      padding: 10,
      paddingVertical: 20,
    },
    content: { flex: 1, paddingRight: 10 },
    image: { width: 90, height: 90, borderRadius: 8 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    meta: { fontSize: 12, color: '#999', marginVertical: 4 },
    summary: { fontSize: 14, color: '#666' },
  });