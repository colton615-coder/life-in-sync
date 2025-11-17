import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInputWithAutocomplete } from '@/hooks/use-autocomplete'
import { AnimatePresence, motion } from 'framer-motion'
import { CaretDown, MagnifyingGlass } from '@phosphor-icons/react'
import { forwardRef } from 'react'

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
    const {
      value,
      setValue,
      suggestions,
      showSuggestions,
      handleSelect,
      handleInputChange,
      handleBlur,
      handleFocus,
    } = useInputWithAutocomplete(historicalData, { maxSuggestions })

    const currentValue = controlledValue !== undefined ? controlledValue : value
    
    const handleChange = (newValue: string) => {
      if (controlledValue !== undefined) {
        onValueChange(newValue)
      } else {
        handleInputChange(newValue)
      }
    }

    const selectSuggestion = (suggestion: string) => {
      if (controlledValue !== undefined) {
        onValueChange(suggestion)
      } else {
        handleSelect(suggestion)
      }
    }

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
            className={className}
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls={`${id}-suggestions`}
            aria-expanded={showSuggestions && suggestions.length > 0}
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
              className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  role="option"
                  type="button"
                  aria-selected={suggestion === currentValue}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent/10 transition-colors flex items-center gap-2 focus:bg-accent/20 focus:outline-none"
                >
                  <CaretDown size={14} className="text-muted-foreground" />
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
