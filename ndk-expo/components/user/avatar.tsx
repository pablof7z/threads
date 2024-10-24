import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Avatar, AvatarImage, AvatarFallback } from 'components/nativewindui/Avatar';
import { useUserProfile } from './profile';

interface AvatarProps extends React.ComponentProps<typeof Avatar> {
    // Add any additional props specific to UserAvatar if needed
}

const UserAvatar: React.FC<AvatarProps> = ({ ...props }) => {
    const { user, userProfile } = useUserProfile();

    useEffect(() => {
        console.log('getting profile', userProfile, user?.pubkey)
    }, [ userProfile ])

    return (
        <View>
            <Avatar {...props}>
                <AvatarImage
                    source={{
                        uri: userProfile?.image || 'https://example.com/default-avatar.png',
                    }}
                />
                <AvatarFallback>
                    <Text className="text-foreground">{user?.pubkey.slice(0, 2).toUpperCase()}</Text>
                </AvatarFallback>
            </Avatar>
        </View>
    );
};

export default UserAvatar;
