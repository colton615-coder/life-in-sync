import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTodayKey(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

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
