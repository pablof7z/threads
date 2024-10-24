import { NDKPrivateKeySigner, NDKSigner, NDKUser } from "@nostr-dev-kit/ndk";

export async function withPrivateKey(key: string): Promise<NDKSigner | null> {
    return new NDKPrivateKeySigner(key);
}
