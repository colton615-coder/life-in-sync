export async function callAIWithRetry(
  promptText: string,
  model: string = 'gpt-4o',
  jsonMode: boolean = false,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[AI Call] Attempt ${attempt}/${maxRetries}`)
      console.log(`[AI Call] Model: ${model}, JSON Mode: ${jsonMode}`)
      console.log(`[AI Call] Prompt length: ${promptText.length} characters`)
      
      const response = await window.spark.llm(promptText, model, jsonMode)
      
      if (!response) {
        throw new Error('AI service returned empty response')
      }
      
      if (typeof response !== 'string') {
        console.error('[AI Call] Invalid response type:', typeof response, response)
        throw new Error(`AI service returned invalid type: ${typeof response}`)
      }
      
      console.log(`[AI Call] Success on attempt ${attempt}`)
      console.log(`[AI Call] Response length: ${response.length} characters`)
      
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[AI Call] Attempt ${attempt}/${maxRetries} failed:`, lastError.message)
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        console.log(`[AI Call] Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  console.error('[AI Call] All attempts failed')
  throw new Error(`AI call failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`)
}

export function parseAIJsonResponse<T>(response: string, expectedStructure?: string): T {
  try {
    console.log('[JSON Parse] Attempting to parse AI response')
    console.log('[JSON Parse] Response length:', response.length)
    console.log('[JSON Parse] Response preview (first 500):', response.substring(0, 500))
    console.log('[JSON Parse] Response preview (last 200):', response.substring(Math.max(0, response.length - 200)))
    
    let cleanedResponse = response.trim()
    
    if (cleanedResponse.startsWith('```json')) {
      console.log('[JSON Parse] Removing JSON markdown code blocks')
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      console.log('[JSON Parse] Removing generic markdown code blocks')
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    cleanedResponse = cleanedResponse.trim()
    
    console.log('[JSON Parse] Checking for truncated/malformed JSON')
    let openBraces = (cleanedResponse.match(/{/g) || []).length
    let closeBraces = (cleanedResponse.match(/}/g) || []).length
    let openBrackets = (cleanedResponse.match(/\[/g) || []).length
    let closeBrackets = (cleanedResponse.match(/\]/g) || []).length
    
    console.log('[JSON Parse] Balance check:', { openBraces, closeBraces, openBrackets, closeBrackets })
    
    if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
      console.warn('[JSON Parse] Unbalanced brackets/braces detected - attempting to fix')
      
      while (openBrackets > closeBrackets) {
        cleanedResponse += ']'
        closeBrackets++
      }
      while (openBraces > closeBraces) {
        cleanedResponse += '}'
        closeBraces++
      }
      
      console.log('[JSON Parse] After balance fix:', { openBraces, closeBraces, openBrackets, closeBrackets })
    }
    
    const lastQuoteIndex = cleanedResponse.lastIndexOf('"')
    if (lastQuoteIndex !== -1) {
      const afterLastQuote = cleanedResponse.substring(lastQuoteIndex + 1).trim()
      if (afterLastQuote && !afterLastQuote.match(/^[\s,\}\]]*$/)) {
        console.warn('[JSON Parse] Possible unterminated string detected, truncating')
        cleanedResponse = cleanedResponse.substring(0, lastQuoteIndex + 1)
        
        while (openBrackets > closeBrackets) {
          cleanedResponse += ']'
          closeBrackets++
        }
        while (openBraces > closeBraces) {
          cleanedResponse += '}'
          closeBraces++
        }
      }
    }
    
    console.log('[JSON Parse] Cleaned response preview (first 300):', cleanedResponse.substring(0, 300))
    console.log('[JSON Parse] Cleaned response preview (last 200):', cleanedResponse.substring(Math.max(0, cleanedResponse.length - 200)))
    
    const parsed = JSON.parse(cleanedResponse)
    console.log('[JSON Parse] Successfully parsed JSON')
    console.log('[JSON Parse] Parsed structure keys:', Object.keys(parsed))
    
    return parsed
  } catch (error) {
    console.error('[JSON Parse] Failed to parse response')
    console.error('[JSON Parse] Error:', error)
    console.error('[JSON Parse] Full raw response:')
    console.error(response)
    if (expectedStructure) {
      console.error('[JSON Parse] Expected structure:', expectedStructure)
    }
    throw new Error(`Failed to parse AI response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function validateAIResponse(data: any, requiredFields: string[]): void {
  const missingFields: string[] = []
  
  for (const field of requiredFields) {
    const fieldPath = field.split('.')
    let current = data
    let fieldExists = true
    
    for (const part of fieldPath) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        fieldExists = false
        break
      }
    }
    
    if (!fieldExists) {
      missingFields.push(field)
    }
  }
  
  if (missingFields.length > 0) {
    console.error('[Validation] Missing required fields:', missingFields)
    console.error('[Validation] Received data structure:', JSON.stringify(data, null, 2))
    throw new Error(`AI response missing required fields: ${missingFields.join(', ')}`)
  }
  
  console.log('[Validation] All required fields present')
}
