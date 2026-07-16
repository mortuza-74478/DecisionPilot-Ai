import { Decision } from '@/types/decision';

const STORAGE_KEY = 'decisionpilot_decisions';
const THEME_KEY = 'decisionpilot_theme';
const KEYS_KEY = 'decisionpilot_apikeys';

export interface SavedApiKeys {
  gemini: string | null;
  openai: string | null;
}

export const dbService = {
  // Load all decisions
  async getDecisions(): Promise<Decision[]> {
    if (typeof window === 'undefined') return [];
    try {
      // Mock delay to feel like a real database query
      await new Promise((resolve) => setTimeout(resolve, 300));
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      // Parse decisions and convert date strings
      const parsed = JSON.parse(data) as Decision[];
      return parsed.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (e) {
      console.error('Error loading decisions from localStorage', e);
      return [];
    }
  },

  // Save or update a decision
  async saveDecision(decision: Decision): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const decisions = await this.getDecisions();
      const index = decisions.findIndex((d) => d.id === decision.id);
      
      const now = new Date().toISOString();
      const updatedDecision = {
        ...decision,
        updatedAt: now,
      };

      if (index >= 0) {
        decisions[index] = updatedDecision;
      } else {
        decisions.unshift(updatedDecision);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
    } catch (e) {
      console.error('Error saving decision to localStorage', e);
      throw new Error('Failed to save decision to database');
    }
  },

  // Delete a decision
  async deleteDecision(id: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const decisions = await this.getDecisions();
      const filtered = decisions.filter((d) => d.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Error deleting decision from localStorage', e);
      throw new Error('Failed to delete decision');
    }
  },

  // Save theme preference
  saveTheme(theme: 'light' | 'dark'): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(THEME_KEY, theme);
  },

  // Load theme preference
  getTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'dark';
    const theme = localStorage.getItem(THEME_KEY);
    return theme === 'light' ? 'light' : 'dark'; // default to dark
  },

  // Save API keys securely in local settings
  saveApiKeys(keys: SavedApiKeys): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS_KEY, JSON.stringify(keys));
  },

  // Load API keys
  getApiKeys(): SavedApiKeys {
    if (typeof window === 'undefined') return { gemini: null, openai: null };
    try {
      const keys = localStorage.getItem(KEYS_KEY);
      if (!keys) {
        // Fallback to environment variables if defined on the server side/in config
        return {
          gemini: process.env.NEXT_PUBLIC_GEMINI_API_KEY || null,
          openai: process.env.NEXT_PUBLIC_OPENAI_API_KEY || null,
        };
      }
      return JSON.parse(keys) as SavedApiKeys;
    } catch {
      return { gemini: null, openai: null };
    }
  }
};
