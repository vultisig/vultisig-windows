import { verifierUrl } from '../config'
import type { ServiceStatus } from '../types'
import type { AgentAuthService } from './AgentAuthService'
import type { AgentBackendClient } from './AgentBackendClient'

export class AgentHealthService {
  private auth: AgentAuthService
  private backendClient: AgentBackendClient

  constructor(auth: AgentAuthService, backendClient: AgentBackendClient) {
    this.auth = auth
    this.backendClient = backendClient
  }

  async checkServices(vaultPubKey: string): Promise<ServiceStatus> {
    const checks = await Promise.allSettled([
      fetch('https://api.vultisig.com/ping', {
        signal: AbortSignal.timeout(5000),
      }),
      fetch(verifierUrl + '/ping', {
        signal: AbortSignal.timeout(5000),
      }),
      fetch(this.backendClient.getBaseUrl() + '/ping', {
        signal: AbortSignal.timeout(5000),
      }),
    ])

    const isOk = (r: PromiseSettledResult<Response>): boolean =>
      r.status === 'fulfilled' && r.value.status < 500

    const status: ServiceStatus = {
      fastVaultServer: isOk(checks[0]),
      verifier: isOk(checks[1]),
      agentBackend: isOk(checks[2]),
      authenticated: false,
    }

    if (vaultPubKey) {
      status.authenticated = await this.auth.validate(vaultPubKey)
    }

    return status
  }
}
