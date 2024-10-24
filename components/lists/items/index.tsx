import { NDKList, NDKSimpleGroupMetadata } from '@nostr-dev-kit/ndk';
import ThreadItem, { type Thread } from './thread';
import GroupItem from './group';
import ListItem from './list';
import { ListRenderItemInfo } from '@/components/nativewindui/List';

export type ListItem = Thread | NDKSimpleGroupMetadata;

export {
    ThreadItem,
    GroupItem,
    ListItem,
}

export function renderItem(
    onThreadPress?: (thread: Thread) => void,
    onGroupPress?: (group: NDKSimpleGroupMetadata) => void,
    onListPress?: (list: NDKList) => void,
) {
    return (info: ListRenderItemInfo<ListItem>) => {
        const { item } = info;
        
        if (item instanceof NDKSimpleGroupMetadata) {
            return (
                <GroupItem {...info} groupMetadata={item} onPress={() => onGroupPress?.(item)} />
            );
        }

        if (item instanceof NDKList) {
            return (
                <ListItem {...info} list={item} onPress={() => onListPress?.(item)} />
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
