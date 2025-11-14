import { GoogleGenerativeAI } from "@google/generative-ai"
import type { GeminiGenerateOptions, GeminiResponse } from "./types"

export class GeminiClient {
  private client: GoogleGenerativeAI | null = null
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized && this.client) {
      return
    }

    const apiKey = await spark.kv.get<string>("gemini-api-key")
    if (!apiKey) {
      throw new Error("Gemini API key not configured. Please add your API key in Settings.")
    }

    this.client = new GoogleGenerativeAI(apiKey)
    this.initialized = true
  }

  async isConfigured(): Promise<boolean> {
    const apiKey = await spark.kv.get<string>("gemini-api-key")
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
      model: options?.model || "gemini-2.0-flash-exp",
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
        model: options?.model || "gemini-2.0-flash-exp",
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

  async testConnection(): Promise<boolean> {
    try {
      await this.generate("Say hello", { temperature: 0.1 })
      return true
    } catch (error) {
      console.error("Gemini connection test failed:", error)
      return false
    }
  }
}

export const gemini = new GeminiClient()
