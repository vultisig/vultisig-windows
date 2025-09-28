import { sendToBackground } from './inpage'

export type KeepaliveMessage = {
  type: 'ping' | 'pong'
  timestamp: number
}

/**
 * Keepalive manager to prevent service worker from sleeping
 * Sends ping messages every 20 seconds to keep the connection alive
 */
class KeepaliveManager {
  private intervalId: NodeJS.Timeout | null = null
  private isActive = false
  private readonly pingInterval = 20000 // 20 seconds
  private lastPongTime = 0
  private readonly maxPongDelay = 5000 // 5 seconds max response time

  start() {
    if (this.isActive) return

    this.isActive = true
    this.lastPongTime = Date.now()

    this.intervalId = setInterval(() => {
      this.sendPing()
    }, this.pingInterval)

    // Send initial ping
    this.sendPing()
  }

  stop() {
    if (!this.isActive) return

    this.isActive = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private async sendPing() {
    if (!this.isActive) return

    try {
      const pingTime = Date.now()

      const response = await sendToBackground<KeepaliveMessage>({
        type: 'ping',
        timestamp: pingTime,
      })

      if (response.type === 'pong') {
        this.lastPongTime = Date.now()
      }
    } catch (error) {
      console.warn('[Keepalive] Ping failed:', error)

      // If ping fails, the service worker might be asleep
      // Try to wake it up with a few rapid pings
      this.handleConnectionLoss()
    }
  }

  private async handleConnectionLoss() {
    // Try 3 rapid pings to wake up the service worker
    for (let i = 0; i < 3; i++) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)) // 500ms delay
        await sendToBackground<KeepaliveMessage>({
          type: 'ping',
          timestamp: Date.now(),
        })
        this.lastPongTime = Date.now()
        return
      } catch (error) {
        console.warn(`[Keepalive] Reconnection attempt ${i + 1} failed:`, error)
      }
    }

    console.error('[Keepalive] Failed to reconnect after 3 attempts')
  }

  isConnectionHealthy(): boolean {
    const timeSinceLastPong = Date.now() - this.lastPongTime
    return timeSinceLastPong < this.pingInterval + this.maxPongDelay
  }

  getStatus() {
    return {
      isActive: this.isActive,
      lastPongTime: this.lastPongTime,
      timeSinceLastPong: Date.now() - this.lastPongTime,
      isHealthy: this.isConnectionHealthy(),
    }
  }
}

const keepaliveManager = new KeepaliveManager()

/**
 * Auto-start keepalive when the page becomes visible
 * Auto-stop when the page becomes hidden to save resources
 */
export const setupAutoKeepalive = () => {
  // Start immediately if page is visible
  if (!document.hidden) {
    keepaliveManager.start()
  }

  // Handle visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      keepaliveManager.stop()
    } else {
      keepaliveManager.start()
    }
  })

  // Handle page unload
  window.addEventListener('beforeunload', () => {
    keepaliveManager.stop()
  })

  // Handle focus events as backup
  window.addEventListener('focus', () => {
    if (!keepaliveManager.getStatus().isHealthy) {
      keepaliveManager.start()
    }
  })
}
