import { Pose, Results } from '@mediapipe/pose'
import { SwingPoseData, SwingLandmark } from '@/lib/types'

/**
 * SwingVideoProcessor
 *
 * Handles the frame-by-frame extraction and MediaPipe Pose estimation
 * for a golf swing video. Prioritizes accuracy over speed.
 */
export class SwingVideoProcessor {
  private pose: Pose
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D | null

  constructor() {
    // Initialize offscreen canvas for frame extraction
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })

    // Initialize MediaPipe Pose
    this.pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      }
    })

    this.pose.setOptions({
      modelComplexity: 1, // 0=Lite, 1=Full, 2=Heavy. 1 is good balance for mobile web.
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
  }

  /**
   * Process a video file and extract pose data for every frame.
   * This uses a seek-and-wait approach to ensure frame accuracy.
   */
  async processVideo(
    videoFile: File,
    onProgress: (progress: number, status: string) => void
  ): Promise<SwingPoseData[]> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.src = URL.createObjectURL(videoFile)
      video.playsInline = true
      video.muted = true
      video.preload = 'auto'

      const poseDataList: SwingPoseData[] = []

      // Hook up the result listener
      // Note: We'll trigger send() manually, but results come back async here
      let currentFrameTimestamp = 0

      this.pose.onResults((results: Results) => {
        if (!results.poseLandmarks) {
           // No pose detected in this frame, push a null or empty entry to keep sync?
           // Or just skip? Better to keep sync if we want timestamp alignment.
           // However, MediaPipe might just not return callback if no result?
           // actually onResults is called for every send() usually.
           poseDataList.push({
             timestamp: currentFrameTimestamp,
             landmarks: [],
             worldLandmarks: []
           })
           return
        }

        const landmarks: SwingLandmark[] = results.poseLandmarks.map(lm => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
          visibility: lm.visibility || 0
        }))

        // Optional: world landmarks for real-world metric calculation (meters)
        const worldLandmarks: SwingLandmark[] = results.poseWorldLandmarks
          ? results.poseWorldLandmarks.map(lm => ({
              x: lm.x,
              y: lm.y,
              z: lm.z,
              visibility: lm.visibility || 0
            }))
          : []

        poseDataList.push({
          timestamp: currentFrameTimestamp,
          landmarks,
          worldLandmarks
        })
      })

      video.onloadedmetadata = async () => {
        try {
          // Resize canvas to match video (for correct aspect ratio processing)
          // Scale down if too massive to save memory on mobile, but keep enough for precision.
          // 720p is usually enough for pose estimation.
          const MAX_HEIGHT = 720
          let width = video.videoWidth
          let height = video.videoHeight

          if (height > MAX_HEIGHT) {
            const ratio = MAX_HEIGHT / height
            height = MAX_HEIGHT
            width = width * ratio
          }

          this.canvas.width = width
          this.canvas.height = height

          const duration = video.duration
          // We will step by a fixed interval to be safe, e.g., 33ms (approx 30fps)
          // or we can try to use requestVideoFrameCallback if supported.

          // For maximum compatibility and control, we'll seek.
          const step = 1 / 30

          let currentTime = 0

          onProgress(0, 'Initializing vision engine...')

          // Warmup
          await this.pose.initialize()

          // Processing Loop
          while (currentTime < duration) {
            // Update progress
            const progress = Math.round((currentTime / duration) * 100)
            onProgress(progress, `Analyzing frame at ${currentTime.toFixed(1)}s...`)

            // Seek
            video.currentTime = currentTime
            await new Promise<void>(r => {
                const onSeeked = () => {
                    video.removeEventListener('seeked', onSeeked)
                    r()
                }
                video.addEventListener('seeked', onSeeked)
            })

            // Draw to canvas
            if (this.ctx) {
                this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height)

                // Process
                currentFrameTimestamp = currentTime
                await this.pose.send({ image: this.canvas })
            }

            // Next frame
            currentTime += step
          }

          onProgress(100, 'Finalizing data...')
          this.pose.close()
          URL.revokeObjectURL(video.src)
          resolve(poseDataList)

        } catch (error) {
          reject(error)
        }
      }

      video.onerror = () => reject(new Error('Video load error'))
    })
  }
}
