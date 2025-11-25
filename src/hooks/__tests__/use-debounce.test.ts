import { renderHook, act, waitFor } from '@testing-library/react'
import { useDebounce } from '../use-debounce'
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 200))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 200 } }
    )

    expect(result.current).toBe('initial')

    rerender({ value: 'updated', delay: 200 })
    expect(result.current).toBe('initial')

    act(() => {
      jest.advanceTimersByTime(199)
    })
    expect(result.current).toBe('initial')

    act(() => {
      jest.advanceTimersByTime(1)
    })
    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })

  it('should cancel previous debounce when value changes rapidly', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'first' })
    act(() => {
      jest.advanceTimersByTime(100)
    })

    rerender({ value: 'second' })
    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(result.current).toBe('initial')

    act(() => {
      jest.advanceTimersByTime(100)
    })
    await waitFor(() => {
      expect(result.current).toBe('second')
    })
  })

  it('should respect custom delay values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    rerender({ value: 'updated', delay: 500 })
    
    act(() => {
      jest.advanceTimersByTime(499)
    })
    expect(result.current).toBe('initial')

    act(() => {
      jest.advanceTimersByTime(1)
    })
    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })

  it('should work with different types', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 42 } }
    )

    expect(result.current).toBe(42)

    rerender({ value: 100 })
    act(() => {
      jest.advanceTimersByTime(200)
    })
    
    await waitFor(() => {
      expect(result.current).toBe(100)
    })
  })

  it('should handle object values', async () => {
    const obj1 = { name: 'John', age: 30 }
    const obj2 = { name: 'Jane', age: 25 }

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: obj1 } }
    )

    expect(result.current).toEqual(obj1)

    rerender({ value: obj2 })
    act(() => {
      jest.advanceTimersByTime(200)
    })

    await waitFor(() => {
      expect(result.current).toEqual(obj2)
    })
  })

  it('should use default delay of 200ms when not specified', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })
    
    act(() => {
      jest.advanceTimersByTime(199)
    })
    expect(result.current).toBe('initial')

    act(() => {
      jest.advanceTimersByTime(1)
    })
    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })
})
