async function safeSparkLLMCall(
  promptText: string,
  model: string = 'gpt-4o',
  jsonMode: boolean = false
): Promise<string> {
  console.log('[Safe LLM Call] Initiating Spark LLM request')
  console.log('[Safe LLM Call] Model:', model, '| JSON Mode:', jsonMode)
  
  try {
    const response = await window.spark.llm(promptText, model, jsonMode)
    
    console.log('[Safe LLM Call] ✅ Response received')
    console.log('[Safe LLM Call] Response type:', typeof response)
    console.log('[Safe LLM Call] Response length:', response?.length || 0)
    
    if (!response) {
      console.error('[Safe LLM Call] ❌ Empty response from Spark LLM')
      throw new Error('AI service returned empty response')
    }
    
    if (typeof response !== 'string') {
      console.error('[Safe LLM Call] ❌ Invalid response type:', typeof response)
      throw new Error(`AI service returned invalid type: ${typeof response}`)
    }
    
    console.log('[Safe LLM Call] Response preview (first 200 chars):', response.substring(0, 200))
    
    if (jsonMode) {
      console.log('[Safe LLM Call] Validating JSON response...')
      try {
        JSON.parse(response)
        console.log('[Safe LLM Call] ✅ Valid JSON response confirmed')
      } catch (jsonError) {
        console.error('[Safe LLM Call] ❌ JSON validation failed')
        console.error('[Safe LLM Call] Raw response that failed:', response)
        throw new Error(`AI returned invalid JSON: ${jsonError instanceof Error ? jsonError.message : 'Parse error'}`)
      }
    }
    
    return response
  } catch (error) {
    console.error('[Safe LLM Call] ❌ Call failed')
    console.error('[Safe LLM Call] Error type:', error?.constructor?.name)
    console.error('[Safe LLM Call] Error message:', error instanceof Error ? error.message : String(error))
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to reach AI service. Please check your connection.')
    }
    
    if (error instanceof SyntaxError) {
      throw new Error('AI service returned malformed response. The server may be experiencing issues.')
    }
    
    throw error
  }
}

export async function callAIWithRetry(
  promptText: string,
  model: string = 'gpt-4o',
  jsonMode: boolean = false,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[AI Retry] 🔄 Attempt ${attempt}/${maxRetries}`)
      console.log(`[AI Retry] Prompt length: ${promptText.length} characters`)
      
      const response = await safeSparkLLMCall(promptText, model, jsonMode)
      
      console.log(`[AI Retry] ✅ Success on attempt ${attempt}`)
      return response
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[AI Retry] ❌ Attempt ${attempt}/${maxRetries} failed:`, lastError.message)
      
      if (error instanceof SyntaxError) {
        console.error('[AI Retry] JSON Parse Error - Server returned non-JSON response')
        console.error('[AI Retry] Possible causes:')
        console.error('[AI Retry]   - HTML error page returned instead of JSON')
        console.error('[AI Retry]   - Response truncated mid-stream')
        console.error('[AI Retry]   - Server timeout or crash')
      }
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        console.log(`[AI Retry] ⏳ Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  console.error('[AI Retry] ❌ All attempts exhausted')
  console.error('[AI Retry] Final error:', {
    message: lastError?.message,
    name: lastError?.name,
    stack: lastError?.stack
  })
  
  if (lastError instanceof SyntaxError) {
    throw new Error('AI service returned invalid response after multiple attempts. Please try again later.')
  }
  
  throw new Error(`AI call failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`)
}

export function parseAIJsonResponse<T>(response: string, expectedStructure?: string): T {
  try {
    console.log('[JSON Parse] Attempting to parse AI response')
    console.log('[JSON Parse] Response length:', response.length)
    console.log('[JSON Parse] Response preview (first 500):', response.substring(0, 500))
    console.log('[JSON Parse] Response preview (last 200):', response.substring(Math.max(0, response.length - 200)))
    
    if (!response || response.trim().length === 0) {
      console.error('[JSON Parse] Empty or whitespace-only response')
      throw new Error('Received empty response from AI service')
    }
    
    let cleanedResponse = response.trim()
    
    if (cleanedResponse.startsWith('```json')) {
      console.log('[JSON Parse] Removing JSON markdown code blocks')
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      console.log('[JSON Parse] Removing generic markdown code blocks')
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    cleanedResponse = cleanedResponse.trim()
    
    if (!cleanedResponse.startsWith('{') && !cleanedResponse.startsWith('[')) {
      console.error('[JSON Parse] Response does not start with JSON bracket/brace')
      console.error('[JSON Parse] First 100 chars:', cleanedResponse.substring(0, 100))
      throw new Error('AI response is not valid JSON (does not start with { or [)')
    }
    
    console.log('[JSON Parse] Checking for truncated/malformed JSON')
    let openBraces = (cleanedResponse.match(/{/g) || []).length
    let closeBraces = (cleanedResponse.match(/}/g) || []).length
    let openBrackets = (cleanedResponse.match(/\[/g) || []).length
    let closeBrackets = (cleanedResponse.match(/\]/g) || []).length
    
    console.log('[JSON Parse] Balance check:', { openBraces, closeBraces, openBrackets, closeBrackets })
    
    if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
      console.warn('[JSON Parse] Unbalanced brackets/braces detected - attempting to fix')
      console.warn('[JSON Parse] This indicates the response was truncated or incomplete')
      
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
        console.warn('[JSON Parse] Content after last quote:', afterLastQuote.substring(0, 50))
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
    console.error('[JSON Parse] ❌ Failed to parse response')
    console.error('[JSON Parse] Error type:', error?.constructor?.name)
    console.error('[JSON Parse] Error message:', error instanceof Error ? error.message : String(error))
    console.error('[JSON Parse] Full raw response (length:', response?.length, '):')
    console.error('[JSON Parse] Raw response start (500 chars):', response?.substring(0, 500))
    console.error('[JSON Parse] Raw response end (500 chars):', response?.substring(Math.max(0, (response?.length || 0) - 500)))
    
    if (expectedStructure) {
      console.error('[JSON Parse] Expected structure:', expectedStructure)
    }
    
    if (error instanceof SyntaxError) {
      const syntaxError = error as SyntaxError
      console.error('[JSON Parse] JSON SyntaxError details:', syntaxError.message)
      
      if (syntaxError.message.includes('Unterminated string')) {
        throw new Error('AI response was incomplete (unterminated string). The server may have timed out or truncated the response.')
      } else if (syntaxError.message.includes('Unexpected token')) {
        throw new Error('AI response contained invalid JSON. The server may have returned an error page instead of JSON.')
      } else if (syntaxError.message.includes('Unexpected end')) {
        throw new Error('AI response was cut off unexpectedly. The server may have experienced an issue.')
      }
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
