export interface VideoValidationResult {
  isValid: boolean
  error?: string
  warning?: string
  fileSize: number
  fileSizeMB: number
  estimatedProcessingTime?: number
}

export const MAX_VIDEO_SIZE_MB = 500
export const WARNING_THRESHOLD_MB = 200
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024

export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
  'video/mpeg',
  'video/x-m4v'
]

export const SUPPORTED_VIDEO_EXTENSIONS = [
  '.mp4',
  '.mov',
  '.avi',
  '.mkv',
  '.webm',
  '.mpeg',
  '.mpg',
  '.m4v'
]

export function validateVideoFile(file: File): VideoValidationResult {
  const fileSizeMB = file.size / (1024 * 1024)
  
  if (!file.type.startsWith('video/')) {
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!SUPPORTED_VIDEO_EXTENSIONS.includes(extension)) {
      return {
        isValid: false,
        error: `File type "${file.type || 'unknown'}" is not supported. Please upload a video file (MP4, MOV, AVI, etc.)`,
        fileSize: file.size,
        fileSizeMB
      }
    }
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Video file is too large (${fileSizeMB.toFixed(2)}MB). Maximum size is ${MAX_VIDEO_SIZE_MB}MB.`,
      fileSize: file.size,
      fileSizeMB
    }
  }

  const result: VideoValidationResult = {
    isValid: true,
    fileSize: file.size,
    fileSizeMB,
    estimatedProcessingTime: estimateProcessingTime(file.size)
  }

  if (fileSizeMB > WARNING_THRESHOLD_MB) {
    result.warning = `Large video file detected (${fileSizeMB.toFixed(2)}MB). Processing may take longer than usual.`
  }

  return result
}

export function estimateProcessingTime(fileSize: number): number {
  const fileSizeMB = fileSize / (1024 * 1024)
  
  if (fileSizeMB < 50) return 15
  if (fileSizeMB < 100) return 25
  if (fileSizeMB < 200) return 40
  if (fileSizeMB < 300) return 60
  if (fileSizeMB < 400) return 80
  return 100
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function getVideoCompressionTips(fileSizeMB: number): string[] {
  const tips: string[] = []
  
  if (fileSizeMB > 400) {
    tips.push('Consider recording at 1080p instead of 4K for faster processing')
    tips.push('Use a shorter video duration (5-10 seconds is usually sufficient)')
    tips.push('Use video compression tools like HandBrake to reduce file size')
  } else if (fileSizeMB > 200) {
    tips.push('Consider trimming to just the swing portion (5-10 seconds)')
    tips.push('Recording at 1080p 30fps provides good quality with smaller file sizes')
  }
  
  return tips
}

export async function getVideoMetadata(file: File): Promise<{
  duration?: number
  width?: number
  height?: number
  frameRate?: number
}> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      const metadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        frameRate: undefined as number | undefined
      }
      
      URL.revokeObjectURL(url)
      resolve(metadata)
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({})
    }
    
    video.src = url
  })
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}
