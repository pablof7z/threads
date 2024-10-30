import { NDKArticle } from '@nostr-dev-kit/ndk';
import { create } from 'zustand';

type ArticleStoreState = {
    activeArticle: NDKArticle | null;
    setArticle: (article?: NDKArticle) => void;
}

/** Store */
export const articleStore = create<ArticleStoreState>((set) => ({
    activeArticle: null,
    setArticle(article?: NDKArticle): void {
        console.log('calling setArticle', !!article)
        set(() => ({ activeArticle: article }))
    }
}));