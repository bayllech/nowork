import { defineStore } from 'pinia';
import { getPhrases } from '../services/api';

export interface PhraseItem {
  id: number;
  content: string;
  weight: number;
}

export type PhrasePage = 'default' | 'roles' | 'share';

export interface PhrasePageMeta {
  offset: number;
  hasMore: boolean;
  initialized: boolean;
}

export interface PhrasesState {
  phrasesByPage: Record<PhrasePage, PhraseItem[]>;
  metaByPage: Record<PhrasePage, PhrasePageMeta>;
  loading: boolean;
  error: string | null;
}

export const usePhrasesStore = defineStore('phrases', {
  state: (): PhrasesState => ({
    phrasesByPage: {
      default: [],
      roles: [],
      share: []
    },
    metaByPage: {
      default: { offset: 0, hasMore: false, initialized: false },
      roles: { offset: 0, hasMore: false, initialized: false },
      share: { offset: 0, hasMore: true, initialized: false }
    },
    loading: false,
    error: null
  }),
  getters: {
    getPhrasesByPage: (state) => {
      return (page: PhrasePage) => state.phrasesByPage[page];
    },
    getMetaByPage: (state) => {
      return (page: PhrasePage) => state.metaByPage[page];
    }
  },
  actions: {
    async fetchPhrases(page: PhrasePage, options?: { append?: boolean; limit?: number }) {
      if (this.loading) {
        return;
      }

      this.loading = true;
      this.error = null;
      const meta = this.metaByPage[page] ?? { offset: 0, hasMore: false, initialized: false };
      const append = options?.append ?? false;
      const limit = options?.limit ?? 20;
      const requestOffset = append ? meta.offset : 0;

      try {
        const response = await getPhrases({ page, limit, offset: requestOffset });
        const targetPage = (['default', 'roles', 'share'] as const).includes(response.page as PhrasePage)
          ? (response.page as PhrasePage)
          : page;

        const mapped = response.phrases.map((item) => ({
          id: item.id,
          content: item.content,
          weight: item.weight
        }));

        if (append) {
          const existing = this.phrasesByPage[targetPage] ?? [];
          const existingIds = new Set(existing.map((item) => item.id));
          const appended: PhraseItem[] = [...existing];
          for (const phrase of mapped) {
            if (!existingIds.has(phrase.id)) {
              appended.push(phrase);
              existingIds.add(phrase.id);
            }
          }
          this.phrasesByPage[targetPage] = appended;
        } else {
          this.phrasesByPage[targetPage] = mapped;
        }

        this.metaByPage[targetPage] = {
          offset: response.nextOffset ?? (append ? meta.offset : mapped.length),
          hasMore: response.hasMore ?? false,
          initialized: true
        };
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取吐槽文案失败';
      } finally {
        this.loading = false;
      }
    }
  }
});
