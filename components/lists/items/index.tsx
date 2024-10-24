import { NDKSimpleGroupMetadata } from '@nostr-dev-kit/ndk';
import ThreadItem, { type Thread } from './thread';
import GroupItem from './group';
import { ListRenderItemInfo } from '@/components/nativewindui/List';

export type ListItem = Thread | NDKSimpleGroupMetadata;

export {
    ThreadItem,
    GroupItem,
}

export function renderItem(
    onThreadPress?: (thread: Thread) => void,
    onGroupPress?: (group: NDKSimpleGroupMetadata) => void,
) {
    return (info: ListRenderItemInfo<ListItem>) => {
        const { item } = info;
        console.log('render item', info);
        
        if (item instanceof NDKSimpleGroupMetadata) {
            return (
                <GroupItem {...info} groupMetadata={item} onPress={() => onGroupPress?.(item)} />
            );
        }

        return (
            <ThreadItem {...info} thread={item} onPress={() => onThreadPress?.(item)} />
        );
    };
    
//     return useCallback((info: ListRenderItemInfo<ListItem>) => {
//         console.log('render item', info);
        
//         if (item instanceof NDKSimpleGroupMetadata) {
//             return <GroupItem groupMetadata={item} />;
//         }

//         return <ThreadItem thread={item} onPress={() => onThreadPress(item)} />;
//     }, [onThreadPress]);
// }
}
