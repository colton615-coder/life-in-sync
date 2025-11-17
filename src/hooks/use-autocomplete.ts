import { useState, useEffect, useMemo } from 'react'

interface AutocompleteOptions {
  maxSuggestions?: number
  minInputLength?: number
  caseSensitive?: boolean
}

export function useAutocomplete(
  historicalData: string[],
  currentInput: string,
  options: AutocompleteOptions = {}
) {
  const {
    maxSuggestions = 5,
    minInputLength = 1,
    caseSensitive = false,
  } = options

  const [suggestions, setSuggestions] = useState<string[]>([])

  const uniqueData = useMemo(() => {
    return Array.from(new Set(historicalData.filter(Boolean)))
  }, [historicalData])

  useEffect(() => {
    if (!currentInput || currentInput.length < minInputLength) {
      setSuggestions([])
      return
    }

    const query = caseSensitive ? currentInput : currentInput.toLowerCase()
    
    const matches = uniqueData
      .filter(item => {
        const compareItem = caseSensitive ? item : item.toLowerCase()
        return compareItem.includes(query) && item !== currentInput
      })
      .sort((a, b) => {
        const aLower = caseSensitive ? a : a.toLowerCase()
        const bLower = caseSensitive ? b : b.toLowerCase()
        const aStarts = aLower.startsWith(query)
        const bStarts = bLower.startsWith(query)
        
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        return aLower.localeCompare(bLower)
      })
      .slice(0, maxSuggestions)

    setSuggestions(matches)
  }, [currentInput, uniqueData, maxSuggestions, minInputLength, caseSensitive])

  return suggestions
}

export function useInputWithAutocomplete(historicalData: string[], options?: AutocompleteOptions) {
  const [value, setValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestions = useAutocomplete(historicalData, value, options)

  const handleSelect = (suggestion: string) => {
    setValue(suggestion)
    setShowSuggestions(false)
  }

  const handleInputChange = (newValue: string) => {
    setValue(newValue)
    setShowSuggestions(true)
  }

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200)
  }

  const handleFocus = () => {
    if (value && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return {
    value,
    setValue,
    suggestions,
    showSuggestions,
    handleSelect,
    handleInputChange,
    handleBlur,
    handleFocus,
  }
}
