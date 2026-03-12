/**
 * Mock Push Notification Server for E2E Testing
 * 
 * Implements the minimal endpoints required by the extension:
 * - GET /vapid-public-key
 * - POST /register
 * - DELETE /unregister
 * 
 * Plus a method to send test notifications.
 */

import express, { Express } from 'express'
import webpush from 'web-push'
import { Server } from 'http'

interface Subscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface RegisteredDevice {
  vaultId: string
  partyName: string
  subscription: Subscription
}

export class MockPushServer {
  private app: Express
  private server: Server | null = null
  private vapidKeys: { publicKey: string; privateKey: string }
  private registeredDevices: Map<string, RegisteredDevice> = new Map()
  private port: number

  constructor(port: number = 3333) {
    this.port = port
    this.vapidKeys = webpush.generateVAPIDKeys()
    this.app = express()
    this.setupRoutes()

    // Configure web-push
    webpush.setVapidDetails(
      'mailto:test@vultisig.com',
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    )
  }

  private setupRoutes() {
    this.app.use(express.json())

    // Return VAPID public key
    this.app.get('/vapid-public-key', (req, res) => {
      console.log('[MockPushServer] GET /vapid-public-key')
      res.json({ public_key: this.vapidKeys.publicKey })
    })

    // Register device
    this.app.post('/register', (req, res) => {
      const { vault_id, party_name, token } = req.body
      console.log(`[MockPushServer] POST /register - vault: ${vault_id}`)
      
      try {
        const subscription = JSON.parse(token) as Subscription
        this.registeredDevices.set(vault_id, {
          vaultId: vault_id,
          partyName: party_name,
          subscription
        })
        res.sendStatus(200)
      } catch (err) {
        console.error('[MockPushServer] Failed to parse subscription:', err)
        res.sendStatus(400)
      }
    })

    // Unregister device
    this.app.delete('/unregister', (req, res) => {
      const { vault_id } = req.body
      console.log(`[MockPushServer] DELETE /unregister - vault: ${vault_id}`)
      this.registeredDevices.delete(vault_id)
      res.sendStatus(200)
    })

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        registeredDevices: this.registeredDevices.size 
      })
    })
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`[MockPushServer] Started on port ${this.port}`)
        resolve()
      })
    })
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('[MockPushServer] Stopped')
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  getUrl(): string {
    return `http://localhost:${this.port}`
  }

  getRegisteredDevices(): Map<string, RegisteredDevice> {
    return this.registeredDevices
  }

  isVaultRegistered(vaultId: string): boolean {
    return this.registeredDevices.has(vaultId)
  }

  /**
   * Send a test notification to a registered vault
   */
  async sendNotification(vaultId: string, title: string, body: string): Promise<boolean> {
    const device = this.registeredDevices.get(vaultId)
    if (!device) {
      console.log(`[MockPushServer] No device registered for vault: ${vaultId}`)
      return false
    }

    const payload = JSON.stringify({
      title,
      body,
      type: 'test',
      timestamp: Date.now()
    })

    try {
      await webpush.sendNotification(device.subscription as any, payload)
      console.log(`[MockPushServer] Notification sent to vault: ${vaultId}`)
      return true
    } catch (err) {
      console.error('[MockPushServer] Failed to send notification:', err)
      return false
    }
  }

  /**
   * Broadcast notification to all registered devices
   */
  async broadcastNotification(title: string, body: string): Promise<number> {
    let sent = 0
    for (const [vaultId] of this.registeredDevices) {
      if (await this.sendNotification(vaultId, title, body)) {
        sent++
      }
    }
    return sent
  }
}

// Singleton for easy access in tests
let serverInstance: MockPushServer | null = null

export async function startMockPushServer(port: number = 3333): Promise<MockPushServer> {
  if (serverInstance) {
    await serverInstance.stop()
  }
  serverInstance = new MockPushServer(port)
  await serverInstance.start()
  return serverInstance
}

export async function stopMockPushServer(): Promise<void> {
  if (serverInstance) {
    await serverInstance.stop()
    serverInstance = null
  }
}

export function getMockPushServer(): MockPushServer | null {
  return serverInstance
}
