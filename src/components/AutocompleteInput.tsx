import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAutocomplete } from '@/hooks/use-autocomplete'
import { AnimatePresence, motion } from 'framer-motion'
import { CaretDown, MagnifyingGlass } from '@phosphor-icons/react'
import { forwardRef, useState, useRef, useCallback, KeyboardEvent } from 'react'

interface AutocompleteInputProps {
  label?: string
  placeholder?: string
  historicalData: string[]
  value?: string
  onValueChange: (value: string) => void
  maxSuggestions?: number
  className?: string
  id?: string
}

export const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ label, placeholder, historicalData, value: controlledValue, onValueChange, maxSuggestions = 5, className, id }, ref) => {
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([])
    
    const currentValue = controlledValue || ''
    const suggestions = useAutocomplete(historicalData, currentValue, { maxSuggestions })

    const handleChange = useCallback((newValue: string) => {
      onValueChange(newValue)
      setShowSuggestions(true)
      setSelectedIndex(-1)
    }, [onValueChange])

    const selectSuggestion = useCallback((suggestion: string) => {
      onValueChange(suggestion)
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }, [onValueChange])

    const handleBlur = useCallback(() => {
      setTimeout(() => {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }, 200)
    }, [])

    const handleFocus = useCallback(() => {
      if (currentValue && suggestions.length > 0) {
        setShowSuggestions(true)
      }
    }, [currentValue, suggestions.length])

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => {
            const next = prev < suggestions.length - 1 ? prev + 1 : 0
            suggestionRefs.current[next]?.scrollIntoView({ block: 'nearest' })
            return next
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => {
            const next = prev > 0 ? prev - 1 : suggestions.length - 1
            suggestionRefs.current[next]?.scrollIntoView({ block: 'nearest' })
            return next
          })
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            selectSuggestion(suggestions[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setShowSuggestions(false)
          setSelectedIndex(-1)
          break
      }
    }, [showSuggestions, suggestions, selectedIndex, selectSuggestion])

    return (
      <div className="relative w-full">
        {label && <Label htmlFor={id} className="mb-2 block">{label}</Label>}
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type="text"
            placeholder={placeholder}
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={className}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-controls={`${id}-suggestions`}
            aria-expanded={showSuggestions && suggestions.length > 0}
            aria-activedescendant={
              selectedIndex >= 0 ? `${id}-option-${selectedIndex}` : undefined
            }
          />
          {currentValue && suggestions.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <MagnifyingGlass size={16} className="text-muted-foreground" />
            </div>
          )}
        </div>
        
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              id={`${id}-suggestions`}
              role="listbox"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  ref={el => { suggestionRefs.current[index] = el }}
                  id={`${id}-option-${index}`}
                  role="option"
                  type="button"
                  aria-selected={index === selectedIndex}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectSuggestion(suggestion)
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 focus:outline-none ${
                    index === selectedIndex 
                      ? 'bg-accent/20' 
                      : 'hover:bg-accent/10'
                  }`}
                >
                  <CaretDown size={14} className="text-muted-foreground" aria-hidden="true" />
                  <span className="text-foreground">{suggestion}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

AutocompleteInput.displayName = 'AutocompleteInput'
