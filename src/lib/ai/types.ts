export type AIProvider = "spark" | "gemini"

export interface AIRequest {
  prompt: string
  provider?: AIProvider
  model?: string
  jsonMode?: boolean
  temperature?: number
  maxOutputTokens?: number
}

export interface AIResponse {
  text: string
  provider: AIProvider
  model: string
  tokens?: number
}

export interface AIUsageStats {
  spark: {
    requests: number
    tokens: number
    cost: number
  }
  gemini: {
    requests: number
    tokens: number
    cost: number
  }
  lastUpdated: string
}
