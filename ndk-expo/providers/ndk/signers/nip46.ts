import NDK, { NDKPrivateKeySigner, NDKNip46Signer } from "@nostr-dev-kit/ndk";

export async function withNip46(ndk: NDK, token: string, sk?: string) {
    let localSigner = NDKPrivateKeySigner.generate();
    if (sk) {
        localSigner = new NDKPrivateKeySigner(sk);
    }

    const remoteSigner = new NDKNip46Signer(ndk, token, localSigner);
    const user = await remoteSigner.blockUntilReady();
    return user ? remoteSigner : null;
}
