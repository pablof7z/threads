import "react-native-get-random-values";
import "@bacons/text-decoder/install";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import NDK, { NDKConstructorParams, NDKEvent, NDKSigner, NDKUser } from "@nostr-dev-kit/ndk";
import { create, StoreApi, UseBoundStore } from 'zustand';
import NDKContext from "@/ndk-expo/context/ndk";
import * as SecureStore from 'expo-secure-store';
import { withPayload } from "./signers";

interface UnpublishedEvent {
    event: NDKEvent;
    relays?: string[];
    lastTryAt?: number;
}

interface IUnpublishedEventStore {
    unpublishedEvents: UnpublishedEvent[];
    addEntry: (entry: UnpublishedEvent) => void;
}

const NDKProvider = ({
    children,
    connect = true,
    ...opts
}: PropsWithChildren<
    NDKConstructorParams & {
        connect?: boolean;
    }
>) => {
    const ndk = useRef(new NDK({
        ...opts
    }));
    const [currentUser, setCurrentUser] = useState<NDKUser | null>(null);
    const useUnpublishedEventStore = create<IUnpublishedEventStore>((set) => ({
        unpublishedEvents: [],
        setEntries: (entries: UnpublishedEvent[]) => set({ unpublishedEvents: entries }),
        addEntry: (entry: UnpublishedEvent) => set((state) => {
            console.log('calling into add event to add', entry.event.id)
            const { unpublishedEvents } = state;
            if (!unpublishedEvents.find(e => e.event.id === entry.event.id))
                unpublishedEvents.push(entry);
            
            console.log('unpublishedEvents.length = '+unpublishedEvents.length)
            
            return { unpublishedEvents };
        })
    }));
    const addEntry = useUnpublishedEventStore(store => store.addEntry);
    const setEntries = useUnpublishedEventStore(store => store.setEntries);

    ndk.current.cacheAdapter?.getUnpublishedEvents?.().then(entry => {
        setEntries(entry);
    })

    if (connect) {
        ndk.current.connect();
    }

    ndk.current.on("event:publish-failed", (event: NDKEvent) => {
        console.log
        addEntry({event});
        event.once("published", () => console.log('event published', event.id))
    })

    useEffect(() => {
        const storePayload = SecureStore.getItem("key");
        
        if (storePayload) {
            loginWithPayload(storePayload, { save: false })
        }
    }, [])

    async function loginWithPayload(payload: string, opts?: { save?: boolean } ) {
        const signer = withPayload(ndk.current, payload);
        
        await login(signer);
        if (ndk.current.signer) return;


        if (opts?.save) {
            SecureStore.setItemAsync("key", payload).then(() => {
                alert("saved")
            })
        }
    }

    async function login(promise: Promise<NDKSigner | null>) {
        promise
            .then((signer) => {
                ndk.current.signer = signer ?? undefined;

                if (signer) {
                    signer.user().then(setCurrentUser)
                } else {
                    setCurrentUser(null);
                }
            })
            .catch((e) => {
                console.log("error in login, removing signer", ndk.current.signer, e);
                ndk.current.signer = undefined;
            });
    }

    async function logout() {
        ndk.current.signer = undefined;
    }

    return (
        <NDKContext.Provider
            value={{
                ndk: ndk.current,
                login,
                loginWithPayload,
                logout,
                currentUser,
                useUnpublishedEventStore
            }}
        >
            {children}
        </NDKContext.Provider>
    );
};

export { NDKProvider };
    