import { create } from 'zustand';
import { Decision, FollowUpQuestion, DecisionResult } from '@/types/decision';
import { dbService, SavedApiKeys } from '@/services/dbService';
import { aiService } from '@/services/aiService';

interface DecisionState {
  decisions: Decision[];
  activeDecisionId: string | null;
  activeCategory: string | null;
  theme: 'light' | 'dark';
  apiKeys: SavedApiKeys;
  isLoading: boolean;
  error: string | null;

  // Initializers
  init: () => Promise<void>;
  
  // Settings & Theme
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  saveApiKeys: (keys: SavedApiKeys) => void;
  
  // Decision Flow Actions
  setActiveDecisionId: (id: string | null) => void;
  setActiveCategory: (category: string | null) => void;
  createDecision: (category: string, question: string) => Promise<void>;
  submitAnswers: (answers: Record<string, string>) => Promise<void>;
  refineDecision: (feedback: string) => Promise<void>;
  deleteDecision: (id: string) => Promise<void>;
  renameDecision: (id: string, title: string) => Promise<void>;
  resetActiveDecisionFlow: () => void;
}

export const useDecisionStore = create<DecisionState>((set, get) => ({
  decisions: [],
  activeDecisionId: null,
  activeCategory: null,
  theme: 'dark',
  apiKeys: { gemini: null, openai: null },
  isLoading: false,
  error: null,

  init: async () => {
    set({ isLoading: true, error: null });
    try {
      const decisions = await dbService.getDecisions();
      const theme = dbService.getTheme();
      const apiKeys = dbService.getApiKeys();
      
      // Sync dark class on mount
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      set({
        decisions,
        theme,
        apiKeys,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to initialize store', isLoading: false });
    }
  },

  setTheme: (theme) => {
    dbService.saveTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  saveApiKeys: (keys) => {
    dbService.saveApiKeys(keys);
    set({ apiKeys: keys });
  },

  setActiveDecisionId: (id) => {
    set({ activeDecisionId: id, error: null });
  },

  setActiveCategory: (category) => {
    set({ activeCategory: category });
  },

  createDecision: async (category, question) => {
    if (!question.trim()) {
      set({ error: 'Please enter a decision question.' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const id = crypto.randomUUID();
      const title = question.length > 35 ? question.substring(0, 35) + '...' : question;
      
      const newDecision: Decision = {
        id,
        title,
        category,
        question,
        status: 'idle',
        followUpQuestions: [],
        answers: {},
        options: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Set immediately to state to show thinking view
      set((state) => ({
        decisions: [newDecision, ...state.decisions],
        activeDecisionId: id,
      }));

      // Generate the follow-up questions
      const apiKeys = get().apiKeys;
      const questions = await aiService.generateQuestions(category, question, apiKeys);

      const finalDecision: Decision = {
        ...newDecision,
        status: questions.length > 0 ? 'questioning' : 'reasoning',
        followUpQuestions: questions,
        updatedAt: new Date().toISOString(),
      };

      // If no follow-up questions are found, trigger recommendation engine directly
      if (questions.length === 0) {
        set({ decisions: get().decisions.map(d => d.id === id ? finalDecision : d) });
        await get().submitAnswers({});
        return;
      }

      await dbService.saveDecision(finalDecision);
      
      set((state) => ({
        decisions: state.decisions.map((d) => (d.id === id ? finalDecision : d)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ 
        error: err.message || 'Failed to initialize decision variables. Please try again.',
        isLoading: false 
      });
      
      // Update decision status to error in state
      const activeId = get().activeDecisionId;
      if (activeId) {
        set((state) => ({
          decisions: state.decisions.map((d) => 
            d.id === activeId ? { ...d, status: 'error', error: err.message } : d
          )
        }));
      }
    }
  },

  submitAnswers: async (answers) => {
    const activeId = get().activeDecisionId;
    if (!activeId) return;

    const activeDecision = get().decisions.find((d) => d.id === activeId);
    if (!activeDecision) return;

    set({ isLoading: true, error: null });

    // Transition state to reasoning status
    const decisionWithAnswers: Decision = {
      ...activeDecision,
      status: 'reasoning',
      answers,
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      decisions: state.decisions.map((d) => (d.id === activeId ? decisionWithAnswers : d)),
    }));

    try {
      const apiKeys = get().apiKeys;
      
      // Trigger AI Recommendation
      const result = await aiService.generateRecommendation(
        activeDecision.category,
        activeDecision.question,
        answers,
        activeDecision.followUpQuestions,
        apiKeys
      );

      // Map options from row names
      const options = result.matrix.rows.map(row => row.name);

      const completedDecision: Decision = {
        ...decisionWithAnswers,
        status: 'completed',
        options,
        result,
        updatedAt: new Date().toISOString(),
      };

      await dbService.saveDecision(completedDecision);

      set((state) => ({
        decisions: state.decisions.map((d) => (d.id === activeId ? completedDecision : d)),
        isLoading: false,
      }));
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred during AI analysis. Please try again.';
      set({ error: errorMsg, isLoading: false });

      const failedDecision: Decision = {
        ...decisionWithAnswers,
        status: 'error',
        error: errorMsg,
        updatedAt: new Date().toISOString(),
      };

      await dbService.saveDecision(failedDecision);

      set((state) => ({
        decisions: state.decisions.map((d) => (d.id === activeId ? failedDecision : d)),
      }));
    }
  },

  refineDecision: async (feedback) => {
    const activeId = get().activeDecisionId;
    if (!activeId) return;

    const activeDecision = get().decisions.find((d) => d.id === activeId);
    if (!activeDecision || !activeDecision.result) return;

    set({ isLoading: true, error: null });

    const refiningDecision: Decision = {
      ...activeDecision,
      status: 'reasoning',
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      decisions: state.decisions.map((d) => (d.id === activeId ? refiningDecision : d)),
    }));

    try {
      const apiKeys = get().apiKeys;
      const refinedResult = await aiService.refineRecommendation(
        activeDecision,
        feedback,
        apiKeys
      );

      const options = refinedResult.matrix.rows.map(row => row.name);

      const completedDecision: Decision = {
        ...refiningDecision,
        status: 'completed',
        options,
        result: refinedResult,
        updatedAt: new Date().toISOString(),
      };

      await dbService.saveDecision(completedDecision);

      set((state) => ({
        decisions: state.decisions.map((d) => (d.id === activeId ? completedDecision : d)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ 
        error: err.message || 'Failed to refine recommendation. Please try again.',
        isLoading: false 
      });

      const failedDecision: Decision = {
        ...refiningDecision,
        status: 'completed', // Fall back to completed with current result
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        decisions: state.decisions.map((d) => (d.id === activeId ? failedDecision : d)),
      }));
    }
  },

  deleteDecision: async (id) => {
    try {
      await dbService.deleteDecision(id);
      set((state) => {
        const nextDecisions = state.decisions.filter((d) => d.id !== id);
        let nextActiveId = state.activeDecisionId;
        if (state.activeDecisionId === id) {
          nextActiveId = nextDecisions.length > 0 ? nextDecisions[0].id : null;
        }
        return {
          decisions: nextDecisions,
          activeDecisionId: nextActiveId,
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete decision.' });
    }
  },

  renameDecision: async (id, title) => {
    if (!title.trim()) return;
    try {
      set((state) => {
        const updated = state.decisions.map((d) => {
          if (d.id === id) {
            const updatedDec = { ...d, title, updatedAt: new Date().toISOString() };
            dbService.saveDecision(updatedDec); // runs asynchronously
            return updatedDec;
          }
          return d;
        });
        return { decisions: updated };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to rename decision.' });
    }
  },

  resetActiveDecisionFlow: () => {
    set({ activeDecisionId: null, error: null });
  }
}));
