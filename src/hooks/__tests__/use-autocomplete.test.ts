import { renderHook, act, waitFor } from '@testing-library/react'
import { useAutocomplete, useInputWithAutocomplete } from '../use-autocomplete'
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

describe('useAutocomplete', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const historicalData = [
    'Apple',
    'Apricot',
    'Banana',
    'Blueberry',
    'Cherry',
    'Date',
    'Elderberry',
    'Fig'
  ]

  it('should return empty array for empty input', () => {
    const { result } = renderHook(() =>
      useAutocomplete(historicalData, '', { debounceMs: 0 })
    )
    expect(result.current).toEqual([])
  })

  it('should return filtered suggestions based on input', async () => {
    const { result, rerender } = renderHook(
      ({ input }) => useAutocomplete(historicalData, input, { debounceMs: 150 }),
      { initialProps: { input: '' } }
    )

    rerender({ input: 'ap' })
    
    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current).toEqual(['Apple', 'Apricot'])
    })
  })

  it('should prioritize suggestions that start with query', async () => {
    const data = ['Banana Split', 'Pineapple Banana', 'Banana Bread', 'Strawberry']
    const { result, rerender } = renderHook(
      ({ input }) => useAutocomplete(data, input, { debounceMs: 150 }),
      { initialProps: { input: '' } }
    )

    rerender({ input: 'ban' })
    
    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      const suggestions = result.current
      expect(suggestions[0]).toMatch(/^Banana/)
      expect(suggestions[1]).toMatch(/^Banana/)
      expect(suggestions[2]).toBe('Pineapple Banana')
    })
  })

  it('should respect maxSuggestions option', async () => {
    const { result, rerender } = renderHook(
      ({ input }) => useAutocomplete(historicalData, input, { maxSuggestions: 3, debounceMs: 150 }),
      { initialProps: { input: '' } }
    )

    rerender({ input: 'e' })
    
    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.length).toBeLessThanOrEqual(3)
    })
  })

  it('should respect minInputLength option', async () => {
    const { result, rerender } = renderHook(
      ({ input }) => useAutocomplete(historicalData, input, { minInputLength: 3, debounceMs: 150 }),
      { initialProps: { input: '' } }
    )

    rerender({ input: 'ap' })
    act(() => {
      jest.advanceTimersByTime(150)
    })
    await waitFor(() => {
      expect(result.current).toEqual([])
    })

    rerender({ input: 'app' })
    act(() => {
      jest.advanceTimersByTime(150)
    })
    await waitFor(() => {
      expect(result.current).toContain('Apple')
    })
  })

  it('should be case insensitive by default', async () => {
    const { result, rerender } = renderHook(
      ({ input }) => useAutocomplete(historicalData, input, { debounceMs: 150 }),
      { initialProps: { input: '' } }
    )

    rerender({ input: 'APPLE' })
    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current).toContain('Apple')
    })
  })

  it('should support case sensitive mode', async () => {
    const data = ['Apple', 'apple', 'APPLE']
    const { result, rerender } = renderHook(
      ({ input }) => useAutocomplete(data, input, { caseSensitive: true, debounceMs: 150 }),
      { initialProps: { input: '' } }
    )

    rerender({ input: 'apple' })
    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current).toEqual(['apple'])
    })
  })

  it('should filter out duplicate values', () => {
    const duplicateData = ['Apple', 'Apple', 'Banana', 'Banana', 'Cherry']
    const { result, rerender } = renderHook(
      ({ input }) => useAutocomplete(duplicateData, input, { debounceMs: 0 }),
      { initialProps: { input: '' } }
    )

    rerender({ input: 'a' })

    expect(result.current).not.toContain('Apple')
    expect(new Set(result.current).size).toBe(result.current.length)
  })

  it('should exclude current input from suggestions', async () => {
    const { result, rerender } = renderHook(
      ({ input }) => useAutocomplete(historicalData, input, { debounceMs: 150 }),
      { initialProps: { input: '' } }
    )

    rerender({ input: 'Apple' })
    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current).not.toContain('Apple')
    })
  })

  it('should handle empty historical data', () => {
    const { result, rerender } = renderHook(
      ({ input }) => useAutocomplete([], input, { debounceMs: 0 }),
      { initialProps: { input: '' } }
    )

    rerender({ input: 'test' })
    expect(result.current).toEqual([])
  })
})

describe('useInputWithAutocomplete', () => {
  const historicalData = ['Apple', 'Apricot', 'Banana']

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should initialize with empty value', () => {
    const { result } = renderHook(() => useInputWithAutocomplete(historicalData))
    expect(result.current.value).toBe('')
    expect(result.current.suggestions).toEqual([])
    expect(result.current.showSuggestions).toBe(false)
  })

  it('should update value on input change', () => {
    const { result } = renderHook(() => useInputWithAutocomplete(historicalData))

    act(() => {
      result.current.handleInputChange('ap')
    })

    expect(result.current.value).toBe('ap')
    expect(result.current.showSuggestions).toBe(true)
  })

  it('should show suggestions on input change', async () => {
    const { result } = renderHook(() => 
      useInputWithAutocomplete(historicalData, { debounceMs: 150 })
    )

    act(() => {
      result.current.handleInputChange('ap')
    })

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.suggestions.length).toBeGreaterThan(0)
      expect(result.current.showSuggestions).toBe(true)
    })
  })

  it('should select suggestion and hide list', () => {
    const { result } = renderHook(() => useInputWithAutocomplete(historicalData))

    act(() => {
      result.current.handleSelect('Apple')
    })

    expect(result.current.value).toBe('Apple')
    expect(result.current.showSuggestions).toBe(false)
  })

  it('should hide suggestions on blur with delay', () => {
    jest.useRealTimers()
    const { result } = renderHook(() => useInputWithAutocomplete(historicalData))

    act(() => {
      result.current.handleInputChange('ap')
    })

    expect(result.current.showSuggestions).toBe(true)

    act(() => {
      result.current.handleBlur()
    })

    setTimeout(() => {
      expect(result.current.showSuggestions).toBe(false)
    }, 250)
  })

  it('should show suggestions on focus if value exists', async () => {
    const { result } = renderHook(() => 
      useInputWithAutocomplete(historicalData, { debounceMs: 150 })
    )

    act(() => {
      result.current.handleInputChange('ap')
    })

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(result.current.suggestions.length).toBeGreaterThan(0)
    })

    act(() => {
      result.current.handleBlur()
    })

    act(() => {
      result.current.handleFocus()
    })

    expect(result.current.showSuggestions).toBe(true)
  })
})
