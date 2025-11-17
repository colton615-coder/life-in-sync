import { GoogleGenerativeAI } from "@google/generative-ai"
import type { GeminiGenerateOptions, GeminiResponse, GeminiConnectionTestResult } from "./types"
import { decrypt } from "@/lib/crypto"

export class GeminiClient {
  private client: GoogleGenerativeAI | null = null
  private initialized = false

  async getApiKey(): Promise<string | null> {
    const encryptedKey = await spark.kv.get<string>("encrypted-gemini-api-key")
    if (encryptedKey) {
      try {
        return await decrypt(encryptedKey)
      } catch (error) {
        console.error("Failed to decrypt API key:", error)
        throw new Error("Failed to decrypt Gemini API key. Please re-save your key in Settings.")
      }
    }

    const envKey = import.meta.env.VITE_GEMINI_API_KEY
    if (envKey) {
      return envKey
    }

    return null
  }

  async initialize(): Promise<void> {
    if (this.initialized && this.client) {
      return
    }

    const apiKey = await this.getApiKey()
    if (!apiKey) {
      throw new Error("Gemini API key not configured. Please add your API key in Settings.")
    }

    this.client = new GoogleGenerativeAI(apiKey)
    this.initialized = true
  }

  async isConfigured(): Promise<boolean> {
    const apiKey = await this.getApiKey()
    return !!apiKey
  }

  async generate(
    prompt: string,
    options?: GeminiGenerateOptions
  ): Promise<GeminiResponse> {
    await this.initialize()

    if (!this.client) {
      throw new Error("Gemini client not initialized")
    }

    const model = this.client.getGenerativeModel({
      model: options?.model || "gemini-1.5-flash",
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxOutputTokens,
        topP: options?.topP,
        topK: options?.topK,
      },
    })

    try {
      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      return {
        text,
        model: options?.model || "gemini-1.5-flash",
        finishReason: response.candidates?.[0]?.finishReason,
      }
    } catch (error: any) {
      if (error.message?.includes("API_KEY_INVALID")) {
        throw new Error("Invalid Gemini API key. Please check your configuration in Settings.")
      }
      throw error
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
      console.error("Failed to parse JSON from Gemini:", jsonText)
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
      
      console.log('[Gemini] Sending test request')
      const response = await this.generate("Respond with exactly: OK", { 
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
      
      if (error.message?.includes('API_KEY_INVALID')) {
        errorMessage = 'Invalid API key'
        details = 'The API key you provided is not recognized by Google. Please verify your key at https://aistudio.google.com/apikey'
      } else if (error.message?.includes('decrypt')) {
        errorMessage = 'Decryption failed'
        details = 'Could not decrypt your stored API key. Please remove and re-add your key.'
      } else if (error.message?.includes('quota')) {
        errorMessage = 'API quota exceeded'
        details = 'Your Gemini API quota has been exceeded. Check your usage at Google AI Studio.'
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
