import NDK, {
    NDKFilter,
    NDKEvent,
    NDKUser,
    NDKNip07Signer,
    NDKNip46Signer,
    NDKPrivateKeySigner,
    NDKSigner,
} from "@nostr-dev-kit/ndk";
import { createContext } from "react";
import { StoreApi } from "zustand";

interface IUnpublishedEventStore {
    unpublishedEvents: NDKEvent[];
    addEvent: (event: NDKEvent) => void;
}

interface NDKContext {
    ndk: NDK | undefined;

    login: (promise: Promise<NDKSigner | null>) => Promise<void>;
    loginWithPayload: (payload: string, { save }: { save?: boolean } ) => Promise<void>;
    logout: () => Promise<void>;
    useUnpublishedEventStore: StoreApi<IUnpublishedEventStore> | undefined;

    currentUser: NDKUser | null;
}

const NDKContext = createContext<NDKContext>({
    ndk: undefined,
    login: () => Promise.resolve(undefined),
    loginWithPayload: () => Promise.resolve(undefined),
    logout: () => Promise.resolve(undefined),

    useUnpublishedEventStore: undefined,
    
    currentUser: null,
});

export default NDKContext;
