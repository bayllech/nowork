import { defineStore } from 'pinia';
import { getPhrases } from '../services/api';

export interface PhraseItem {
  id: number;
  content: string;
  weight: number;
}

export type PhrasePage = 'default' | 'roles' | 'share';

export interface PhrasesState {
  phrasesByPage: Record<PhrasePage, PhraseItem[]>;
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
    loading: false,
    error: null
  }),
  getters: {
    getPhrasesByPage: (state) => {
      return (page: PhrasePage) => state.phrasesByPage[page];
    }
  },
  actions: {
    async fetchPhrases(page: PhrasePage) {
      this.loading = true;
      this.error = null;
      try {
        const response = await getPhrases({ page, limit: 20 });
        const targetPage = response.page as PhrasePage;
        this.phrasesByPage[targetPage] = response.phrases.map((item, index) => ({
          id: index,
          content: item.content,
          weight: item.weight
        }));
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取吐槽文案失败';
      } finally {
        this.loading = false;
      }
    }
  }
});
