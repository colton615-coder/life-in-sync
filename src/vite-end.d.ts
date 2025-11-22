/// <reference types="vite/client" />

declare global {
  interface Window {
    spark: {
      llmPrompt(strings: TemplateStringsArray, ...values: unknown[]): string
      llm(prompt: string, modelName?: string, jsonMode?: boolean): Promise<string | object>
      user(): Promise<{
        avatarUrl?: string
        email: string
        id: string
        isOwner: boolean
        login?: string
        name: string
      }>
      kv: {
        keys?(): Promise<string[]>
        get<T>(key: string): Promise<T | undefined | null>
        set<T>(key: string, value: T): Promise<void>
        delete(key: string): Promise<void>
      }
    }
  }
}
