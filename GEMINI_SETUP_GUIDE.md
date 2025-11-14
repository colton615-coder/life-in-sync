# Gemini 2.5 Setup Guide

This guide explains how to set up and use Google's Gemini 2.5 AI model in your Habit Tracker application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Getting Your API Key](#getting-your-api-key)
3. [Configuration](#configuration)
4. [Usage Examples](#usage-examples)
5. [AI Provider Comparison](#ai-provider-comparison)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Your app now supports **two AI providers**:

- **Spark LLM (GPT-4o)** - Built-in, always available, no configuration needed
- **Google Gemini 2.5** - Optional, requires API key, cost-effective for long contexts

The system intelligently routes requests between providers based on your preferences and automatically falls back if one fails.

### Architecture

```
┌─────────────────┐
│   Your Code     │
└────────┬────────┘
         │
    ┌────▼────┐
    │   AI    │  ← Unified interface
    │ Router  │
    └────┬────┘
         │
    ┌────┴────────┐
    │             │
┌───▼───┐    ┌───▼───────┐
│ Spark │    │  Gemini   │
│  LLM  │    │    2.5    │
└───────┘    └───────────┘
```

---

## 🔑 Getting Your API Key

### Step 1: Visit Google AI Studio

Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Step 2: Create an API Key

1. Sign in with your Google account
2. Click "Create API Key"
3. Choose a Google Cloud project (or create a new one)
4. Copy the generated API key

### Step 3: Store Your Key Securely

⚠️ **Important Security Notes:**
- Never commit API keys to version control
- Never expose keys in client-side code
- The app stores keys encrypted in the Spark KV store
- Only the app owner can configure API keys

---

## ⚙️ Configuration

### Navigate to Settings

1. Open your app
2. Click the navigation button (bottom-right)
3. Select "Settings"

### Add Your API Key

1. In the "Gemini API Configuration" section
2. Paste your API key into the input field
3. Click "Save"
4. Click "Test Connection" to verify it works

### Choose Your Preferred Provider

In the "AI Provider Preferences" section, select:

- **Automatic** - Let the system choose the best provider for each task
- **Spark LLM** - Always use GPT-4o (built-in)
- **Gemini 2.5** - Always use Gemini (requires API key)

---

## 💻 Usage Examples

### Basic Usage

```typescript
import { ai } from '@/lib/ai/provider'

// Simple text generation
const response = await ai.generate({
  prompt: "Generate a motivational quote",
  provider: "gemini",  // or "spark" or omit for automatic
  temperature: 0.8
})

console.log(response.text)
```

### JSON Mode

```typescript
// Generate structured data
const response = await ai.generate({
  prompt: "List 5 healthy breakfast ideas. Return as JSON array.",
  provider: "gemini",
  jsonMode: true,
  temperature: 0.7
})

const ideas = JSON.parse(response.text)
```

### Using the Gemini Client Directly

```typescript
import { gemini } from '@/lib/gemini/client'

// Text generation
const result = await gemini.generate(
  "Explain quantum computing in simple terms",
  { temperature: 0.5 }
)

// JSON generation (handles parsing automatically)
const data = await gemini.generateJSON(
  "Create a workout plan with 5 exercises",
  { temperature: 0.6 }
)
```

### Pre-built Helper Functions

```typescript
import {
  generateMotivationalQuote,
  generateHabitSuggestions,
  analyzeSpendingPattern,
  generateWorkoutPlan
} from '@/lib/ai/examples'

// Generate a motivational quote
const quote = await generateMotivationalQuote("perseverance")

// Get habit suggestions based on existing habits
const suggestions = await generateHabitSuggestions([
  "Morning run",
  "Read 30 minutes",
  "Meditate"
])

// Analyze spending patterns
const analysis = await analyzeSpendingPattern([
  { category: "Food", amount: 150, date: "2024-01-15" },
  { category: "Transport", amount: 80, date: "2024-01-16" }
])

// Generate a workout plan
const workout = await generateWorkoutPlan(
  "intermediate",
  "strength training",
  45
)
```

### With React Components

```typescript
import { useState } from 'react'
import { ai } from '@/lib/ai/provider'
import { AIBadge } from '@/components/AIBadge'

function MyComponent() {
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState<'spark' | 'gemini'>('gemini')

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await ai.generate({
        prompt: "Your prompt here",
        provider: "gemini"
      })
      setResult(response.text)
      setProvider(response.provider)
    } catch (error) {
      console.error("AI generation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>
      
      {result && (
        <div>
          <AIBadge provider={provider} />
          <p>{result}</p>
        </div>
      )}
    </div>
  )
}
```

---

## ⚡ AI Provider Comparison

| Feature | Spark LLM (GPT-4o) | Gemini 2.5 |
|---------|-------------------|------------|
| **Setup** | ✓ None needed | Requires API key |
| **Speed** | ⚡ Very fast | ⚡ Fast |
| **Context Length** | 128K tokens | 2M tokens |
| **Cost** | Included | ~$0.00001/token |
| **JSON Mode** | ✓ Excellent | ✓ Good |
| **Best For** | Quick responses, JSON | Long context, analysis |
| **Reliability** | ✓✓✓ Very high | ✓✓ High |

### When to Use Each Provider

**Use Spark LLM (GPT-4o) for:**
- Quick responses needed
- High-reliability requirements
- Structured JSON output
- Short to medium context
- No API key setup desired

**Use Gemini 2.5 for:**
- Long document analysis
- Cost-sensitive applications
- Complex reasoning tasks
- Very long context (> 100K tokens)
- When you have an API key configured

**Use Automatic for:**
- Mixed workloads
- Best balance of cost and performance
- Automatic fallback protection

---

## 🎯 Best Practices

### 1. Prompt Engineering

```typescript
// ❌ Vague prompt
"Make me a budget"

// ✅ Specific prompt
`Create a monthly budget for someone earning $5000/month with:
- $1200 rent
- $500 debt payments
- Goal to save 20%
Return as JSON with category allocations.`
```

### 2. Temperature Settings

```typescript
// Factual/structured content (low creativity)
temperature: 0.2 - 0.4  // Financial advice, data analysis

// Balanced
temperature: 0.5 - 0.7  // General responses, suggestions

// Creative content (high variability)
temperature: 0.8 - 1.0  // Motivational quotes, brainstorming
```

### 3. Error Handling

```typescript
import { ai } from '@/lib/ai/provider'
import { toast } from 'sonner'

async function generateWithFallback() {
  try {
    const response = await ai.generate({
      prompt: "Your prompt",
      provider: "gemini"  // Will auto-fallback to Spark if Gemini fails
    })
    return response.text
  } catch (error) {
    toast.error("AI generation failed. Please try again.")
    console.error("AI Error:", error)
    return null
  }
}
```

### 4. JSON Parsing

```typescript
// Always validate JSON responses
async function safeJSONGenerate(prompt: string) {
  try {
    const response = await ai.generate({
      prompt,
      jsonMode: true
    })
    
    const data = JSON.parse(response.text)
    
    // Validate structure
    if (!data || typeof data !== 'object') {
      throw new Error("Invalid JSON structure")
    }
    
    return data
  } catch (error) {
    console.error("JSON parsing failed:", error)
    return null
  }
}
```

### 5. Cost Optimization

```typescript
// Check usage stats periodically
import { getUsageStats } from '@/lib/ai/usage-tracker'

const stats = await getUsageStats()
console.log(`Total cost: $${stats.spark.cost + stats.gemini.cost}`)

// Use appropriate model for the task
// For simple tasks, prefer Spark's gpt-4o-mini or Gemini's flash models
const response = await ai.generate({
  prompt: "Simple task",
  model: "gemini-2.0-flash-exp",  // Faster, cheaper
  provider: "gemini"
})
```

---

## 🔧 Troubleshooting

### "Gemini API key not configured"

**Solution:** Go to Settings and add your API key from Google AI Studio.

### "Invalid Gemini API key"

**Possible causes:**
1. API key was copied incorrectly (check for extra spaces)
2. API key was revoked in Google Cloud Console
3. API key doesn't have proper permissions

**Solution:** 
- Verify your API key at [Google AI Studio](https://aistudio.google.com/apikey)
- Generate a new key if needed
- Re-save in Settings and test connection

### "All AI providers failed"

**Possible causes:**
1. No internet connection
2. Gemini API key invalid and Spark LLM unavailable
3. Rate limits exceeded

**Solution:**
1. Check internet connection
2. Verify API key in Settings
3. Wait a few minutes if rate limited
4. Check the browser console for detailed error messages

### JSON Parsing Errors

**Symptoms:** "Invalid JSON response from Gemini"

**Solution:**
1. Make your prompt more explicit about JSON format
2. Provide an example of the expected structure
3. Use the `generateJSON` method which includes better formatting instructions

```typescript
// Add explicit JSON instructions
const prompt = `
Your task here.

Return ONLY valid JSON in this exact format:
{
  "field1": "value",
  "field2": ["item1", "item2"]
}
`
```

### Slow Responses

**Possible causes:**
1. Very long prompts
2. High `maxOutputTokens` setting
3. Network latency

**Solution:**
1. Shorten prompts where possible
2. Set reasonable `maxOutputTokens` (default is usually fine)
3. Use streaming for long responses (advanced)

---

## 📊 Monitoring Usage

### View Usage Statistics

Navigate to **Settings** to see:
- Request counts per provider
- Token usage
- Estimated costs
- Last updated timestamp

### Reset Statistics

Click "Reset Stats" to clear usage tracking (useful for monthly monitoring).

---

## 🚀 Advanced Features

### Custom Model Selection

```typescript
// Use different Gemini models
const response = await ai.generate({
  prompt: "Complex reasoning task",
  provider: "gemini",
  model: "gemini-2.0-flash-exp"  // Faster, experimental
})
```

### Provider Fallback Chain

The system automatically tries providers in this order:
1. Your preferred provider (if set)
2. Optimal provider for task (if "auto")
3. Alternative provider if primary fails

### Multimodal Support (Coming Soon)

Gemini 2.5 supports vision and audio:
- Image analysis for nutrition tracking
- Video analysis for workout form checking
- Audio transcription for voice notes

---

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini Pricing](https://ai.google.dev/pricing)
- [Best Practices Guide](https://ai.google.dev/docs/best_practices)
- [Prompt Engineering Guide](https://ai.google.dev/docs/prompting_intro)

---

## 🤝 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review the browser console for errors
3. Verify your API key is valid
4. Try the "Test Connection" button in Settings

---

## 🎉 Success!

You're now ready to use Gemini 2.5 in your app! Start by:

1. ✅ Adding your API key in Settings
2. ✅ Testing the connection
3. ✅ Trying one of the example functions
4. ✅ Building your own AI-powered features

Happy building! 🚀
