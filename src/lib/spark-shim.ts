// Shim for GitHub Spark API to allow running on standard web environments (Vercel, etc.)

export const sparkShim = {
  llm: async (prompt: string, model?: string, jsonMode?: boolean) => {
    console.log('Spark LLM Shim Called:', { prompt, model, jsonMode });
    // Return a safe dummy response
    if (jsonMode) {
      return {};
    }
    return "AI features are currently disabled in this deployment.";
  },

  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => {
    // Simple template tag shim
    return strings.reduce((acc, str, i) => {
      return acc + str + (values[i] !== undefined ? values[i] : '');
    }, '');
  },

  user: async () => {
    return {
      id: 'user_local',
      name: 'Local User',
      email: 'user@local',
      isOwner: true // Assume local user is owner
    };
  },

  kv: {
    get: async <T>(key: string): Promise<T | null> => {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        console.error('KV Get Error', e);
        return null;
      }
    },
    set: async (key: string, value: any): Promise<void> => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        // Dispatch event to sync with useKV hook
        window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key, newValue: JSON.stringify(value) } }));
      } catch (e) {
        console.error('KV Set Error', e);
      }
    },
    delete: async (key: string): Promise<void> => {
      try {
        window.localStorage.removeItem(key);
        window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key, newValue: null } }));
      } catch (e) {
        console.error('KV Delete Error', e);
      }
    }
  }
};
