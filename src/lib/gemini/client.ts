import { GoogleGenerativeAI } from "@google/generative-ai"
import type { GeminiGenerateOptions, GeminiResponse, GeminiConnectionTestResult } from "./types"
import { decrypt } from "@/lib/crypto"
import { DEFAULT_GEMINI_MODEL } from "./config"

export class GeminiClient {
  private client: GoogleGenerativeAI | null = null
  private initialized = false

  async getApiKey(): Promise<string | null> {
    const encryptedKey = await window.spark.kv.get<string>('encrypted-gemini-api-key')
    if (!encryptedKey) {
      return null
    }

    try {
      const decryptedKey = await decrypt(encryptedKey)
      return decryptedKey
    } catch (error) {
      console.error('[GeminiClient] Failed to decrypt API key:', error)
      await window.spark.kv.delete('encrypted-gemini-api-key')
      throw new Error('Failed to decrypt API key. Please re-enter your key in Settings.')
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized && this.client) {
      console.log('[GeminiClient] Already initialized, skipping')
      return
    }

    console.log('[GeminiClient] Initializing client')
    const apiKey = await this.getApiKey()
    if (!apiKey) {
      console.error('[GeminiClient] No API key available')
      throw new Error("Gemini API key not configured. Please add your API key in Settings.")
    }

    console.log('[GeminiClient] Creating GoogleGenerativeAI client')
    this.client = new GoogleGenerativeAI(apiKey)
    this.initialized = true
    console.log('[GeminiClient] Client initialized successfully')
  }

  async isConfigured(): Promise<boolean> {
    const apiKey = await this.getApiKey()
    return !!apiKey
  }

  async generate(
    prompt: string,
    options?: GeminiGenerateOptions
  ): Promise<GeminiResponse> {
    console.log('[GeminiClient] Starting generate request')
    console.log('[GeminiClient] Options:', options)
    console.log('[GeminiClient] Prompt length:', prompt.length)
    
    await this.initialize()

    if (!this.client) {
      throw new Error("Gemini client not initialized")
    }

    const modelName = options?.model || DEFAULT_GEMINI_MODEL
    console.log('[GeminiClient] Using model:', modelName)
    
    try {
      const model = this.client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxOutputTokens,
          topP: options?.topP,
          topK: options?.topK,
        },
      })

      console.log('[GeminiClient] Sending request to Gemini API...')
      const result = await model.generateContent(prompt)
      console.log('[GeminiClient] ✅ Received response from Gemini API')
      
      const response = result.response
      const text = response.text()
      console.log('[GeminiClient] Response text length:', text.length)
      console.log('[GeminiClient] Response preview:', text.substring(0, 150))
      console.log('[GeminiClient] Finish reason:', response.candidates?.[0]?.finishReason)

      return {
        text,
        model: modelName,
        finishReason: response.candidates?.[0]?.finishReason,
      }
    } catch (error: any) {
      console.error('[GeminiClient] ❌ Generate request failed')
      console.error('[GeminiClient] Error type:', error?.constructor?.name)
      console.error('[GeminiClient] Error message:', error?.message)
      console.error('[GeminiClient] Error status:', error?.status)
      console.error('[GeminiClient] Error details:', error?.errorDetails)
      
      if (error?.status === 404 || error?.message?.includes('404')) {
        console.error('[GeminiClient] 404 Error - Model not found or incorrect endpoint')
        console.error('[GeminiClient] Requested model:', modelName)
        console.error('[GeminiClient] This usually means:')
        console.error('[GeminiClient]   1. Model name is incorrect or not available')
        console.error('[GeminiClient]   2. API endpoint version mismatch')
        console.error('[GeminiClient]   3. API key lacks permissions for this model')
        throw new Error(`Model "${modelName}" not found or not accessible. The application is configured to use "${DEFAULT_GEMINI_MODEL}". Please check your API key permissions for this model.`)
      }
      
      if (error?.message?.includes("API_KEY_INVALID") || error?.status === 400) {
        throw new Error("Invalid Gemini API key. Please check your configuration in Settings.")
      }
      
      if (error?.message?.includes("quota") || error?.status === 429) {
        throw new Error(`Gemini API quota exceeded. ${error.message}`)
      }
      
      if (error?.message?.includes("PERMISSION_DENIED") || error?.status === 403) {
        throw new Error(`Permission denied. Your API key may not have access to the "${modelName}" model. The application is configured to use "${DEFAULT_GEMINI_MODEL}".`)
      }
      
      console.error('[GeminiClient] Full error object:', error)
      throw new Error(`Gemini API error: ${error?.message || 'Unknown error'}`)
    }
  }

  async generateJSON<T = any>(
    prompt: string,
    options?: GeminiGenerateOptions
  ): Promise<T> {
    const enhancedPrompt = `${prompt}

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no explanations, no other text. Just the raw JSON object.`

    const response = await this.generate(enhancedPrompt, options)
    
    let jsonText = response.text.trim()
    
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "")
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "")
    }
    
    try {
      return JSON.parse(jsonText)
    } catch (error) {
      console.error("[GeminiClient] Failed to parse JSON from Gemini:", jsonText)
      throw new Error("Invalid JSON response from Gemini")
    }
  }

  async testConnection(): Promise<GeminiConnectionTestResult> {
    try {
      console.log('[Gemini] Starting connection test')
      
      const apiKey = await this.getApiKey()
      if (!apiKey) {
        return {
          success: false,
          error: 'No API key configured',
          details: 'Please add your Gemini API key in the settings above.'
        }
      }
      
      console.log('[Gemini] API key retrieved, length:', apiKey.length)
      
      if (apiKey.length < 20) {
        return {
          success: false,
          error: 'API key appears invalid',
          details: 'The API key is too short. Please verify you copied the complete key from Google AI Studio.'
        }
      }
      
      if (!apiKey.startsWith('AI')) {
        return {
          success: false,
          error: 'API key format incorrect',
          details: 'Gemini API keys should start with "AI". Please verify your key.'
        }
      }
      
      console.log('[Gemini] Initializing client')
      await this.initialize()
      
      console.log(`[Gemini] Sending test request with ${DEFAULT_GEMINI_MODEL} model`)
      const response = await this.generate("Respond with exactly: OK", { 
        model: DEFAULT_GEMINI_MODEL,
        temperature: 0.1,
        maxOutputTokens: 10
      })
      
      console.log('[Gemini] Test response:', response.text)
      
      return {
        success: true,
        details: `Connected successfully using ${response.model}`
      }
    } catch (error: any) {
      console.error('[Gemini] Connection test failed:', error)
      
      let errorMessage = 'Connection failed'
      let details = ''
      
      if (error.status === 404 || error.message?.includes('404') || error.message?.includes('not found')) {
        errorMessage = 'Model not found (404)'
        details = `The model may not be available for your API key or region. The application is configured to use "${DEFAULT_GEMINI_MODEL}".`
      } else if (error.message?.includes('API_KEY_INVALID') || error.status === 400) {
        errorMessage = 'Invalid API key'
        details = 'The API key you provided is not recognized by Google. Please verify your key at https://aistudio.google.com/apikey'
      } else if (error.message?.includes('decrypt')) {
        errorMessage = 'Decryption failed'
        details = 'Could not decrypt your stored API key. Please remove and re-add your key.'
      } else if (error.message?.includes('quota') || error.status === 429) {
        errorMessage = 'API quota exceeded'
        details = 'Your Gemini API quota has been exceeded. Check your usage at Google AI Studio.'
      } else if (error.message?.includes('PERMISSION_DENIED') || error.status === 403) {
        errorMessage = 'Permission denied'
        details = `Your API key does not have permission to access this model. The application is configured to use "${DEFAULT_GEMINI_MODEL}".`
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error'
        details = 'Could not reach Google AI servers. Check your internet connection.'
      } else if (error.message) {
        errorMessage = 'Connection error'
        details = error.message
      }
      
      return {
        success: false,
        error: errorMessage,
        details
      }
    }
  }
}

export const gemini = new GeminiClient()
