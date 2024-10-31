import "react-native-get-random-values";
import "@bacons/text-decoder/install";
import { PropsWithChildren, useRef, useState } from "react";
import NDK, { NDKConstructorParams, NDKEvent, NDKRelay, NDKSigner, NDKUser } from "@nostr-dev-kit/ndk";
import NDKContext from "@/ndk-expo/context/ndk";

const NDKProvider = ({
    children,
    connect = true,
    ...opts
}: PropsWithChildren<
    NDKConstructorParams & {
        connect?: boolean;
    }
>) => {
    const ndk = useRef(new NDK(opts));
    ndk.netDebug = (msg: string, relay: NDKRelay) => {
        const url = new URL(relay.url);
        console.log('👉', url.hostname, msg);
    }
    const [currentUser, setCurrentUser] = useState<NDKUser | null>(null);
    

    ndk.current.debug.enabled = true;

    if (connect) {
        ndk.current.connect();
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
                logout,
                currentUser,
            }}
        >
            {children}
        </NDKContext.Provider>
    );
};

export { NDKProvider };
