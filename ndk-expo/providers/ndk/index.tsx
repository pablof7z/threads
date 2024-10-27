import "react-native-get-random-values";
import "@bacons/text-decoder/install";
import { PropsWithChildren, useState } from "react";
import NDK, { NDKConstructorParams, NDKEvent, NDKSigner, NDKUser } from "@nostr-dev-kit/ndk";
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
    const [ndk, setNDK] = useState<NDK>(new NDK(opts));
    const [currentUser, setCurrentUser] = useState<NDKUser | null>(null);

    ndk.debug.enable = true;

    if (connect) {
        ndk.connect();
    }

    async function login(promise: Promise<NDKSigner | null>) {
        promise
            .then((signer) => {
                ndk.signer = signer ?? undefined;

                if (signer) {
                    signer.user().then(setCurrentUser)
                } else {
                    setCurrentUser(null);
                }
            })
            .catch((e) => {
                console.log("error in login, removing signer", ndk.signer, e);
                ndk.signer = undefined;
            });
    }

    async function logout() {
        ndk.signer = undefined;
    }

    return (
        <NDKContext.Provider
            value={{
                ndk,
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
