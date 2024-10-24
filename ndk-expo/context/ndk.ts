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

interface NDKContext {
    ndk: NDK | undefined;

    login: (promise: Promise<NDKSigner | null>) => Promise<void>;
    logout: () => Promise<void>;

    currentUser: NDKUser | null;
}

const NDKContext = createContext<NDKContext>({
    ndk: undefined,
    login: () => Promise.resolve(undefined),
    logout: () => Promise.resolve(undefined),
    currentUser: null,
});

export default NDKContext;
