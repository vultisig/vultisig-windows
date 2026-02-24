import type { ServiceStatus } from '../types'
import type { AgentAuthService } from './AgentAuthService'

export class AgentHealthService {
  private auth: AgentAuthService

  constructor(auth: AgentAuthService) {
    this.auth = auth
  }

  async checkServices(vaultPubKey: string): Promise<ServiceStatus> {
    const authenticated = vaultPubKey
      ? await this.auth.validate(vaultPubKey)
      : false

    return { authenticated }
  }
}
