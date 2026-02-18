import {
  formatHumanAmount,
  resolveTickerByChainAndToken,
} from './assetResolution'

function resolveAssetObj(obj: Record<string, unknown>): {
  chain: string
  token: string
  ticker: string
} {
  const chain = String(obj.chain ?? '')
  let token = ''
  if (obj.token != null) {
    token = String(obj.token)
  }
  const ticker = resolveTickerByChainAndToken(chain, token)
  return { chain, token, ticker }
}

function resolveConfigAsset(
  config: Record<string, unknown>,
  field: string
): { chain: string; token: string; ticker: string } {
  const raw = config[field]
  if (!raw || typeof raw !== 'object')
    return { chain: '', token: '', ticker: '' }
  return resolveAssetObj(raw as Record<string, unknown>)
}

export function enrichPolicyFields(
  policy: Record<string, unknown>,
  config: Record<string, unknown>
): void {
  if (!config) return

  const assetObj = config.asset
  if (assetObj && typeof assetObj === 'object') {
    const { chain, token, ticker } = resolveAssetObj(
      assetObj as Record<string, unknown>
    )
    if (ticker) {
      policy.from_asset = ticker
      policy.fromAsset = ticker
      policy.from_chain = chain
    }
    const recipients = config.recipients
    if (Array.isArray(recipients) && recipients.length > 0) {
      const r = recipients[0] as Record<string, unknown>
      if (r.toAddress != null) {
        policy.to_address = String(r.toAddress)
      }
      if (r.amount != null) {
        policy.amount = formatHumanAmount(String(r.amount), chain, token)
      }
    }
  } else {
    const from = resolveConfigAsset(config, 'from')
    if (from.ticker) {
      policy.from_asset = from.ticker
      policy.fromAsset = from.ticker
      policy.from_chain = from.chain
    }

    const to = resolveConfigAsset(config, 'to')
    if (to.ticker) {
      policy.to_asset = to.ticker
      policy.toAsset = to.ticker
      policy.to_chain = to.chain
    }

    if (config.fromAmount != null) {
      policy.amount = formatHumanAmount(
        String(config.fromAmount),
        from.chain,
        from.token
      )
    }
  }

  if (config.frequency != null) {
    policy.frequency = String(config.frequency)
    policy.schedule = String(config.frequency)
  }
}

export function computeNextExecution(
  createdAt: string,
  frequency: string
): string {
  const created = new Date(createdAt)
  if (isNaN(created.getTime())) return ''

  const now = new Date()

  if (frequency === 'monthly') {
    const next = new Date(created)
    while (next <= now) {
      next.setUTCMonth(next.getUTCMonth() + 1)
    }
    return next.toISOString()
  }

  let intervalMs: number
  switch (frequency) {
    case 'hourly':
      intervalMs = 60 * 60 * 1000
      break
    case 'daily':
      intervalMs = 24 * 60 * 60 * 1000
      break
    case 'weekly':
      intervalMs = 7 * 24 * 60 * 60 * 1000
      break
    default:
      return ''
  }

  const elapsed = now.getTime() - created.getTime()
  if (elapsed < 0) return created.toISOString()

  const periods = Math.floor(elapsed / intervalMs) + 1
  const next = new Date(created.getTime() + periods * intervalMs)
  return next.toISOString()
}
