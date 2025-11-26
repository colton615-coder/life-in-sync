import { useState, useMemo } from 'react'
import { useDebounce } from './use-debounce'

interface AutocompleteOptions {
  maxSuggestions?: number
  minInputLength?: number
  caseSensitive?: boolean
  debounceMs?: number
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
    debounceMs = 150,
  } = options

  const debouncedInput = useDebounce(currentInput, debounceMs)

  const uniqueData = useMemo(() => {
    return Array.from(new Set(historicalData.filter(Boolean)))
  }, [historicalData])

  const filteredSuggestions = useMemo(() => {
    if (!debouncedInput || debouncedInput.length < minInputLength) {
      return []
    }

    const query = caseSensitive ? debouncedInput : debouncedInput.toLowerCase()
    
    const matches = uniqueData
      .filter(item => {
        const compareItem = caseSensitive ? item : item.toLowerCase()
        return compareItem.includes(query) && item !== debouncedInput
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

    return matches
  }, [debouncedInput, uniqueData, maxSuggestions, minInputLength, caseSensitive])

  return filteredSuggestions
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
