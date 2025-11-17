import { GoogleGenerativeAI } from "@google/generative-ai"
import type { GeminiGenerateOptions, GeminiResponse, GeminiConnectionTestResult } from "./types"
import { decrypt } from "@/lib/crypto"
import { DEFAULT_GEMINI_MODEL } from "./config"

export class GeminiClient {
  private client: GoogleGenerativeAI | null = null
  private currentApiKey: string | null = null

  async getApiKey(): Promise<string | null> {
    const encryptedKey = await window.spark.kv.get<string>('encrypted-gemini-api-key')
    if (!encryptedKey) {
      // Also check for environment variable as a fallback
      const envKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (envKey) {
        return envKey;
      }
      return null
    }

    try {
      const decryptedKey = await decrypt(encryptedKey)
      return decryptedKey
    } catch (error) {
      console.error('[GeminiClient] Failed to decrypt API key:', error)
      await window.spark.kv.delete('encrypted-gemini-api-key')
      throw new Error('Failed to decrypt API key. It has been removed. Please re-enter your key in Settings.')
    }
  }

  private async initialize(): Promise<void> {
    const apiKey = await this.getApiKey();

    // Case 1: No API key is available.
    if (!apiKey) {
      if (this.client) {
        console.log('[GeminiClient] API key removed. De-initializing client.');
      }
      this.client = null;
      this.currentApiKey = null;
      return; // Do not throw error here, let the calling function handle it.
    }

    // Case 2: API key is present, but it's different from the current one, or client is not created.
    if (apiKey !== this.currentApiKey || !this.client) {
      console.log('[GeminiClient] API key changed or client not set. Initializing...');
      this.client = new GoogleGenerativeAI(apiKey);
      this.currentApiKey = apiKey;
      console.log('[GeminiClient] Client initialized successfully.');
    }
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
      console.error('[GeminiClient] Generation failed: client not initialized or API key missing.');
      throw new Error("Gemini API key not configured. Please add your API key in Settings.");
    }

    const modelName = options?.model || DEFAULT_GEMINI_MODEL
    
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

      const result = await model.generateContent(prompt)
      
      const response = result.response
      const text = response.text()

      return {
        text,
        model: modelName,
        finishReason: response.candidates?.[0]?.finishReason,
      }
    } catch (error: unknown) {
      const err = error as Error
      
      if (err?.message?.includes("API_KEY_INVALID") || (err as any)?.code === 400) {
        throw new Error("Invalid Gemini API key. Please check your configuration in Settings.");
      }
      
      if (err?.message?.includes("quota") || (err as any)?.code === 429) {
        throw new Error(`Gemini API quota exceeded. ${err.message}`);
      }
      
      if (err?.message?.includes("PERMISSION_DENIED") || (err as any)?.code === 403) {
        throw new Error(`Permission denied. Your API key may not have access to the "${modelName}" model.`);
      }
      
      console.error('[GeminiClient] Full error object:', error)
      throw new Error(`Gemini API error: ${err?.message || 'Unknown error'}`)
    }
  }

  async generateJSON<T = unknown>(
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
      jsonText = jsonText.replace(/```\n?/g, "").replace(/```\n?$/g, "")
    }
    
    try {
      return JSON.parse(jsonText)
    } catch {
      console.error("[GeminiClient] Failed to parse JSON from Gemini:", jsonText)
      throw new Error("Invalid JSON response from Gemini")
    }
  }

  async testConnection(): Promise<GeminiConnectionTestResult> {
    try {
      const apiKey = await this.getApiKey()
      if (!apiKey) {
        return {
          success: false,
          error: 'No API key configured',
          details: 'Please add your Gemini API key in the settings or set the VITE_GEMINI_API_KEY environment variable.'
        }
      }
      
      if (apiKey.length < 20) {
        return {
          success: false,
          error: 'API key appears invalid',
          details: 'The API key is too short. Please verify you copied the complete key.'
        }
      }
      
      await this.initialize()
      
      const response = await this.generate("Respond with exactly: OK", { 
        model: DEFAULT_GEMINI_MODEL,
        temperature: 0.1,
        maxOutputTokens: 10
      })
      
      if (!response.text.includes('OK')) {
        throw new Error('Did not receive expected "OK" response from test.')
      }
      
      return {
        success: true,
        details: `Connected successfully using ${response.model}`
      }
    } catch (error: unknown) {
      const err = error as Error
      let errorMessage = 'Connection failed'
      let details = err.message
      
      if (err.message?.includes('API_KEY_INVALID')) {
        errorMessage = 'Invalid API key'
        details = 'The API key you provided is not recognized by Google. Please verify your key.'
      } else if (err.message?.includes('decrypt')) {
        errorMessage = 'Decryption failed'
        details = 'Could not decrypt your stored API key. Please remove and re-add your key.'
      } else if (err.message?.includes('quota')) {
        errorMessage = 'API quota exceeded'
        details = 'Your Gemini API quota has been exceeded. Check your usage at Google AI Studio.'
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
