import type { AIProvider, AIUsageStats } from "./types"

export async function trackUsage(
  provider: AIProvider,
  tokens: number
): Promise<void> {
  const stats = await getUsageStats()

  const costPerToken = provider === "gemini" ? 0.00001 : 0.00003

  stats[provider].requests++
  stats[provider].tokens += tokens
  stats[provider].cost += tokens * costPerToken
  stats.lastUpdated = new Date().toISOString()

  await spark.kv.set("ai-usage-stats", stats)
}

export async function getUsageStats(): Promise<AIUsageStats> {
  const stats = await spark.kv.get<AIUsageStats>("ai-usage-stats")
  
  if (!stats) {
    return {
      spark: { requests: 0, tokens: 0, cost: 0 },
      gemini: { requests: 0, tokens: 0, cost: 0 },
      lastUpdated: new Date().toISOString(),
    }
  }
  
  return stats
}

export async function resetUsageStats(): Promise<void> {
  await spark.kv.set("ai-usage-stats", {
    spark: { requests: 0, tokens: 0, cost: 0 },
    gemini: { requests: 0, tokens: 0, cost: 0 },
    lastUpdated: new Date().toISOString(),
  })
}
