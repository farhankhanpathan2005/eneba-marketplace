import { useState, useEffect } from 'react'

/** Debounces a value by the given delay (ms). */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

/** Alias for useDebounce for consistency with task requirements */
export const useDebouncedValue = useDebounce

export type ToastType = 'success' | 'error' | 'info'
interface Toast { id: number; message: string; type: ToastType }

let toastIdCounter = 0
const listeners = new Set<(t: Toast) => void>()

export function toast(message: string, type: ToastType = 'info') {
  const t: Toast = { id: ++toastIdCounter, message, type }
  listeners.forEach(fn => fn(t))
  setTimeout(() => {
    listeners.forEach(fn => fn({ id: -1, message: '', type: 'info' }))
  }, 3500)
}

export function useToast() {
  const [list, setList] = useState<Toast[]>([])
  useEffect(() => {
    const fn = (t: Toast) => {
      setList(prev => {
        if (t.id === -1) return prev.filter(x => x.id !== toastIdCounter) // dismiss
        const existing = prev.find(x => x.id === toastIdCounter)
        if (existing) return prev.map(x => x.id === toastIdCounter ? t : x)
        return [...prev, t]
      })
    }
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  }, [])
  return list
}