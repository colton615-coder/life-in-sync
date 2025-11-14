# Gemini Pro 2.5 Integration Plan

## Overview
This document outlines the strategy for integrating Google's Gemini Pro 2.5 AI model into the Habit Tracker application, alongside the existing Spark LLM API that currently uses GPT-4o models.

## Current LLM Architecture

### Existing Spark LLM API
The app currently uses the `spark.llm()` API which provides:
- **Models Available**: `gpt-4o` (default), `gpt-4o-mini`
- **JSON Mode**: Optional structured output parsing
- **Prompt Creation**: `spark.llmPrompt` template tag for safe prompt construction

### Current Usage Points
1. **Daily Affirmations** (LoadingScreen.tsx) - Uses `gpt-4o-mini`
2. **AI Financial Advisor** (Finance module) - Multi-step interview and budget generation
3. **Potential Future Uses**:
   - Habit suggestions based on completion patterns
   - Task prioritization recommendations
   - Workout plan generation
   - Analytics insights and trend analysis

---

## Integration Strategy

### Option 1: Direct API Integration (Recommended for Maximum Control)

#### Implementation Approach
Create a dedicated Gemini service layer that works alongside the existing Spark LLM API.

#### Architecture
```
src/lib/
├── gemini/
│   ├── client.ts          # Gemini API client configuration
│   ├── prompts.ts         # Gemini-specific prompt templates
│   ├── types.ts           # TypeScript types for Gemini responses
│   └── hooks.ts           # React hooks for Gemini integration
└── ai/
    ├── provider.ts        # AI provider abstraction layer
    └── router.ts          # Intelligent routing between Spark LLM and Gemini
```

#### Key Considerations

**✅ Advantages:**
- Full control over API calls and response handling
- Can leverage Gemini-specific features (multimodal, long context)
- Cost optimization through provider selection
- Parallel API calls for comparison/fallback

**⚠️ Challenges:**
- Requires API key management
- Need to handle authentication securely
- Rate limiting and error handling
- CORS considerations (may need proxy)

**🔐 Security Note:**
- **Never store API keys in frontend code or environment variables**
- Gemini API keys should be stored in the Spark KV store using the owner's authentication
- Only the app owner should be able to configure API keys
- API calls should be made from the browser directly to Google's API (no backend proxy needed)

---

### Option 2: Spark SDK Extension (Future-Proof)

Wait for or request official Gemini support in the Spark SDK.

#### Potential API Design
```typescript
// Hypothetical future API
const response = await spark.llm(prompt, "gemini-2.5-pro", true)

// Or with provider selection
const response = await spark.ai.generate(prompt, {
  provider: "gemini",
  model: "gemini-2.5-pro",
  temperature: 0.7,
  jsonMode: true
})
```

**✅ Advantages:**
- Consistent API with existing Spark patterns
- Managed authentication and security
- Built-in error handling and retries

**⚠️ Disadvantages:**
- Dependent on Spark team implementation timeline
- Less control over Gemini-specific features
- May not support all Gemini capabilities

---

## Recommended Implementation Plan

### Phase 1: Setup & Configuration (Week 1)

#### 1.1 API Key Management UI
Create a settings section for the app owner to securely configure Gemini API key:

```typescript
// src/components/modules/Settings.tsx (new)
import { useKV } from '@github/spark/hooks'

function GeminiSettings() {
  const [apiKey, setApiKey] = useKV<string>("gemini-api-key", "")
  const user = await spark.user()
  
  if (!user.isOwner) {
    return null // Only owner can configure
  }
  
  return (
    <div>
      <h3>Gemini API Configuration</h3>
      <Input 
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter Gemini API Key"
      />
    </div>
  )
}
```

#### 1.2 Gemini Client Setup
```typescript
// src/lib/gemini/client.ts
import { GoogleGenerativeAI } from "@google/generative-ai"

export class GeminiClient {
  private client: GoogleGenerativeAI | null = null
  
  async initialize() {
    const apiKey = await spark.kv.get<string>("gemini-api-key")
    if (!apiKey) {
      throw new Error("Gemini API key not configured")
    }
    this.client = new GoogleGenerativeAI(apiKey)
  }
  
  async generate(prompt: string, options?: GenerateOptions) {
    if (!this.client) await this.initialize()
    
    const model = this.client.getGenerativeModel({ 
      model: options?.model || "gemini-2.5-pro" 
    })
    
    const result = await model.generateContent(prompt)
    return result.response.text()
  }
  
  async generateJSON(prompt: string, schema?: any) {
    const enhancedPrompt = `${prompt}\n\nReturn ONLY valid JSON, no other text.`
    const response = await this.generate(enhancedPrompt)
    return JSON.parse(response)
  }
}

export const gemini = new GeminiClient()
```

#### 1.3 Install Required Package
```bash
npm install @google/generative-ai
```

---

### Phase 2: AI Provider Abstraction (Week 1-2)

Create a unified interface that can route between Spark LLM (GPT) and Gemini:

```typescript
// src/lib/ai/provider.ts
export type AIProvider = "spark" | "gemini"

export interface AIRequest {
  prompt: string
  provider?: AIProvider
  model?: string
  jsonMode?: boolean
  temperature?: number
}

export interface AIResponse {
  text: string
  provider: AIProvider
  model: string
  tokens?: number
}

export class AIRouter {
  async generate(request: AIRequest): Promise<AIResponse> {
    const provider = request.provider || "spark"
    
    if (provider === "gemini") {
      const response = await gemini.generate(request.prompt, {
        model: request.model || "gemini-2.5-pro",
        temperature: request.temperature
      })
      
      return {
        text: response,
        provider: "gemini",
        model: request.model || "gemini-2.5-pro"
      }
    }
    
    // Default to Spark LLM
    const sparkModel = request.model || "gpt-4o"
    const prompt = spark.llmPrompt`${request.prompt}`
    const response = await spark.llm(prompt, sparkModel, request.jsonMode)
    
    return {
      text: response,
      provider: "spark",
      model: sparkModel
    }
  }
}

export const ai = new AIRouter()
```

---

### Phase 3: Feature Integration (Week 2-3)

#### 3.1 Smart Feature Assignment
Decide which features use which AI provider based on strengths:

| Feature | Provider | Model | Reasoning |
|---------|----------|-------|-----------|
| Daily Affirmations | Spark LLM | gpt-4o-mini | Fast, cheap, already working well |
| Financial Advisor | **Gemini** | gemini-2.5-pro | Better reasoning, longer context for complex financial scenarios |
| Habit Suggestions | **Gemini** | gemini-2.5-flash | Fast inference for real-time suggestions |
| Analytics Insights | **Gemini** | gemini-2.5-pro | Strong analytical capabilities |
| Workout Generation | Either | Both supported | Allow user preference |
| Task Prioritization | **Gemini** | gemini-2.5-flash | Quick response needed |

#### 3.2 Enhanced Financial Advisor with Gemini

```typescript
// src/lib/ai/financial-advisor.ts
import { ai } from './provider'

export async function generateBudgetPlan(profile: FinancialProfile) {
  const prompt = `You are an expert financial advisor. Analyze this financial profile and create a detailed budget plan:

Income: $${profile.income}/month
Housing: $${profile.housing}/month
Debt: $${profile.debt}/month at ${profile.interestRate}% APR
Goals: ${profile.goals.join(', ')}
Spending Habits: ${profile.spendingHabits}

Create a comprehensive budget with:
1. Category allocations
2. Savings strategy
3. Debt payoff plan
4. Timeline to reach goals

Return as JSON with this structure:
{
  "budget": { "category": amount, ... },
  "savingsStrategy": "...",
  "debtPlan": "...",
  "timeline": "...",
  "reasoning": "..."
}`

  const response = await ai.generate({
    prompt,
    provider: "gemini",
    model: "gemini-2.5-pro",
    jsonMode: true,
    temperature: 0.4 // Lower for financial accuracy
  })
  
  return JSON.parse(response.text)
}
```

#### 3.3 New Feature: AI Habit Coach

```typescript
// src/lib/ai/habit-coach.ts
export async function getHabitInsights(habitHistory: HabitData[]) {
  const prompt = `Analyze these habit completion patterns and provide actionable insights:

${JSON.stringify(habitHistory, null, 2)}

Identify:
1. Strongest habits (high completion rate)
2. Struggling habits (low completion rate)
3. Patterns (day of week, time correlations)
4. Personalized suggestions for improvement

Return as JSON.`

  const response = await ai.generate({
    prompt,
    provider: "gemini",
    model: "gemini-2.5-pro",
    jsonMode: true
  })
  
  return JSON.parse(response.text)
}
```

---

### Phase 4: UI Enhancement (Week 3-4)

#### 4.1 AI Provider Indicator
Show users which AI is powering each feature:

```typescript
// src/components/AIBadge.tsx
export function AIBadge({ provider }: { provider: AIProvider }) {
  const config = {
    spark: { label: "GPT-4o", color: "text-primary" },
    gemini: { label: "Gemini 2.5", color: "text-accent" }
  }
  
  const { label, color } = config[provider]
  
  return (
    <Badge variant="outline" className={cn("gap-1", color)}>
      <Sparkle size={12} />
      {label}
    </Badge>
  )
}
```

#### 4.2 Settings Panel for AI Preferences
```typescript
// Add to Settings module
function AIPreferences() {
  const [preferredProvider, setPreferredProvider] = useKV<AIProvider>(
    "preferred-ai-provider", 
    "spark"
  )
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Provider Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={preferredProvider} onValueChange={setPreferredProvider}>
          <SelectItem value="spark">Spark LLM (GPT-4o)</SelectItem>
          <SelectItem value="gemini">Google Gemini 2.5</SelectItem>
          <SelectItem value="auto">Automatic (Best for task)</SelectItem>
        </Select>
      </CardContent>
    </Card>
  )
}
```

---

## Testing Strategy

### Unit Tests
```typescript
// src/lib/gemini/client.test.ts
describe('GeminiClient', () => {
  it('should generate text response', async () => {
    const response = await gemini.generate("Say hello")
    expect(response).toBeTruthy()
  })
  
  it('should parse JSON responses', async () => {
    const response = await gemini.generateJSON(
      "Return JSON: { 'greeting': 'hello' }"
    )
    expect(response.greeting).toBe('hello')
  })
  
  it('should handle API errors gracefully', async () => {
    // Mock failed API call
    await expect(gemini.generate("test")).rejects.toThrow()
  })
})
```

### Integration Tests
- Test fallback from Gemini to Spark LLM on failure
- Test API key validation flow
- Test response parsing for both providers
- Test cost tracking and usage limits

---

## Cost Optimization

### Token Usage Tracking
```typescript
// src/lib/ai/usage-tracker.ts
import { useKV } from '@github/spark/hooks'

export interface UsageStats {
  spark: { requests: number; tokens: number; cost: number }
  gemini: { requests: number; tokens: number; cost: number }
}

export async function trackUsage(
  provider: AIProvider, 
  tokens: number
) {
  const stats = await spark.kv.get<UsageStats>("ai-usage-stats") || {
    spark: { requests: 0, tokens: 0, cost: 0 },
    gemini: { requests: 0, tokens: 0, cost: 0 }
  }
  
  const costPerToken = provider === "gemini" ? 0.00001 : 0.00003
  
  stats[provider].requests++
  stats[provider].tokens += tokens
  stats[provider].cost += tokens * costPerToken
  
  await spark.kv.set("ai-usage-stats", stats)
}
```

### Cost Comparison Dashboard
Display real-time cost comparison between providers to help owner make informed decisions.

---

## Error Handling & Fallbacks

```typescript
// src/lib/ai/provider.ts (enhanced)
export class AIRouter {
  async generate(request: AIRequest): Promise<AIResponse> {
    const provider = request.provider || await this.getOptimalProvider(request)
    
    try {
      // Try primary provider
      return await this.callProvider(provider, request)
    } catch (primaryError) {
      console.error(`${provider} failed:`, primaryError)
      
      // Fallback to alternative provider
      const fallbackProvider = provider === "gemini" ? "spark" : "gemini"
      
      try {
        return await this.callProvider(fallbackProvider, request)
      } catch (fallbackError) {
        console.error(`${fallbackProvider} also failed:`, fallbackError)
        throw new Error("All AI providers failed")
      }
    }
  }
  
  private async getOptimalProvider(request: AIRequest): Promise<AIProvider> {
    // Check user preference
    const preferred = await spark.kv.get<AIProvider>("preferred-ai-provider")
    if (preferred && preferred !== "auto") return preferred
    
    // Check if Gemini is configured
    const geminiKey = await spark.kv.get<string>("gemini-api-key")
    if (!geminiKey) return "spark"
    
    // Smart routing based on task complexity
    if (request.prompt.length > 10000) return "gemini" // Long context
    if (request.jsonMode) return "spark" // Better JSON support
    
    return "spark" // Default
  }
}
```

---

## Security Checklist

- [ ] API keys stored in KV, never in code
- [ ] Only app owner can configure API keys
- [ ] API keys encrypted at rest
- [ ] Rate limiting implemented
- [ ] Usage tracking prevents abuse
- [ ] Error messages don't leak API keys
- [ ] CORS configured correctly
- [ ] Input sanitization for prompts
- [ ] Output validation for responses

---

## Migration Path

### Week 1: Foundation
1. Add Gemini API key configuration UI
2. Install @google/generative-ai package
3. Create GeminiClient class
4. Test basic text generation

### Week 2: Integration
1. Build AIRouter abstraction layer
2. Add provider selection logic
3. Implement usage tracking
4. Create fallback mechanisms

### Week 3: Feature Migration
1. Migrate Financial Advisor to Gemini
2. Add AI Habit Coach feature
3. Build analytics insights
4. Test all features thoroughly

### Week 4: Polish & Optimization
1. Add AI provider indicators in UI
2. Build usage dashboard
3. Optimize cost per feature
4. Add user preferences
5. Complete documentation

---

## Future Enhancements

### Multimodal Capabilities
Gemini 2.5 supports vision and audio:
- Upload food photos for nutrition tracking
- Workout form analysis from video
- Voice input for task creation

### Advanced Features
- **Agentic Workflows**: Let AI autonomously suggest and create habits based on goals
- **Predictive Analytics**: Forecast habit success rates
- **Natural Language Interface**: "Show me my water intake for last week"
- **Collaborative AI**: Multiple AI providers vote on recommendations

---

## Resources & Documentation

### Gemini API
- [Gemini API Docs](https://ai.google.dev/docs)
- [Gemini Pro 2.5 Guide](https://ai.google.dev/models/gemini)
- [Pricing Calculator](https://ai.google.dev/pricing)

### Best Practices
- Keep prompts concise and specific
- Use system instructions for consistent behavior
- Implement caching for repeated queries
- Monitor token usage actively
- Test edge cases thoroughly

---

## Success Metrics

### Technical
- [ ] API response time < 3s for 95% of requests
- [ ] Fallback success rate > 99%
- [ ] Zero API key leaks or security incidents
- [ ] Token usage within budget

### User Experience
- [ ] Users report AI insights as valuable
- [ ] Financial advice accuracy validated
- [ ] Habit suggestions increase completion rates
- [ ] No user confusion about AI providers

---

## Conclusion

Integrating Gemini Pro 2.5 alongside Spark's existing LLM API will:
1. **Enhance capabilities** - Leverage Gemini's reasoning for complex tasks
2. **Optimize costs** - Route requests to most cost-effective provider
3. **Improve reliability** - Built-in fallback between providers
4. **Enable new features** - Multimodal support opens new possibilities

The recommended approach is **Option 1: Direct API Integration** with a robust abstraction layer that allows seamless switching between providers. This gives maximum control while maintaining the option to adopt official Spark SDK support if/when available.

Start with Phase 1 this week to establish the foundation, then progressively migrate features to optimal providers based on their strengths.
