export function sanitizeForLLM(input: string | undefined | null): string {
  if (!input) return ''
  
  let sanitized = String(input)
  
  sanitized = sanitized
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    
  sanitized = sanitized
    .replace(/ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?)/gi, '')
    .replace(/disregard\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?)/gi, '')
    .replace(/forget\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?)/gi, '')
    .replace(/new\s+(instructions?|prompts?|commands?):/gi, '')
    .replace(/system\s+(prompt|message|instruction):/gi, '')
    .replace(/you\s+are\s+now/gi, '')
    .replace(/act\s+as\s+(if|a)/gi, 'behave like')
    .replace(/pretend\s+(you|to)/gi, '')
    .replace(/roleplay\s+as/gi, '')
    .replace(/<\|.*?\|>/g, '')
    .replace(/\[INST\].*?\[\/INST\]/g, '')
    .replace(/\[SYS\].*?\[\/SYS\]/g, '')
  
  sanitized = sanitized
    .replace(/[<>]/g, '')
    .replace(/&lt;|&gt;/g, '')
  
  sanitized = sanitized.slice(0, 2000)
  
  return sanitized.trim()
}

export function parseAIResponse(response: string): any {
  if (!response || typeof response !== 'string') {
    throw new Error('Invalid AI response: empty or not a string')
  }

  let cleaned = response.trim()

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```\s*$/, '').trim()
  }

  try {
    return JSON.parse(cleaned)
  } catch (firstError) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch (secondError) {
        console.error('Failed to parse AI response after extraction:', secondError)
      }
    }

    const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0])
      } catch (thirdError) {
        console.error('Failed to parse AI response as array:', thirdError)
      }
    }

    console.error('All parse strategies failed. Response:', response.substring(0, 500))
    throw new Error(
      `Failed to parse AI response as JSON. ${firstError instanceof Error ? firstError.message : 'Unknown error'}`
    )
  }
}
