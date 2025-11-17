export interface GeminiGenerateOptions {
  model?: string
  temperature?: number
  maxOutputTokens?: number
  topP?: number
  topK?: number
}

export interface GeminiResponse {
  text: string
  model: string
  finishReason?: string
}

export interface GeminiError {
  code: string
  message: string
  status: number
}

export interface GeminiConnectionTestResult {
  success: boolean
  error?: string
  details?: string
}
