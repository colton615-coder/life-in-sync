export const APP_CONFIG = {
  VERSION: '2.0',
  STORAGE_KEYS: {
    FINANCE: {
        AUDIT: 'finance-audit-v2',
        REPORT: 'finance-report-v2'
    },
    GEMINI_API_KEY: 'gemini-api-key'
  },
  AI: {
      MODEL_NAME: 'gemini-2.5-pro',
      MAX_RETRIES: 3,
      INITIAL_RETRY_DELAY: 1000
  }
} as const;
