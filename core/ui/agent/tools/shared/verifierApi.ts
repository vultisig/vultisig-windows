import { verifierUrl } from '../../config'

const verifierBaseUrl = verifierUrl

type ApiResponse<T> = {
  data?: T
  error?: { message: string; code?: string }
}

type Plugin = {
  id: string
  title: string
  description: string
  logo?: string
  categories?: string[]
  version?: string
  plugin_version?: string
  author?: string
  pricing?: AppPricing[]
}

type AppPricing = {
  id: string
  pluginId: string
  amount: number
  asset: string
  type: string
  frequency: string
  metric: string
}

type PluginListResponse = {
  plugins: Plugin[]
  total_count: number
}

type RecipeSpecification = {
  description: string
  configuration_schema: Record<string, unknown>
  configuration_example?: unknown
  supported_chains?: string[]
  supported_assets?: string[]
  required_fields?: string[]
}

type Policy = {
  id: string
  plugin_id: string
  public_key: string
  name?: string
  active: boolean
  configuration: Record<string, unknown>
  recipe?: string
  created_at: string
  updated_at?: string
}

type PolicyListResponse = {
  policies: Policy[]
  total_count: number
}

type Transaction = {
  id: string
  policy_id: string
  tx_hash: string
  status: string
  status_onchain?: string
  created_at: string
}

type TransactionListResponse = {
  history: Transaction[]
  total_count: number
}

function bearerAuth(token: string): string {
  const t = token.trim()
  if (!t) return ''
  if (t.toLowerCase().startsWith('bearer '))
    return 'Bearer ' + t.slice(7).trim()
  return 'Bearer ' + t
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = verifierBaseUrl + path
  const resp = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const body = await resp.text()

  if (!resp.ok) {
    throw new Error(`API error (status ${resp.status}): ${body}`)
  }

  let parsed: ApiResponse<T>
  try {
    parsed = JSON.parse(body) as ApiResponse<T>
  } catch {
    return JSON.parse(body) as T
  }

  if (parsed.error?.message) {
    throw new Error(`API error: ${parsed.error.message}`)
  }

  if (parsed.data !== undefined) {
    return parsed.data
  }

  return parsed as unknown as T
}

async function fetchApiWithAuth<T>(
  path: string,
  authToken: string,
  options: RequestInit = {}
): Promise<T> {
  return fetchApi<T>(path, {
    ...options,
    headers: {
      ...options.headers,
      ...(authToken ? { Authorization: bearerAuth(authToken) } : {}),
    },
  })
}

export async function listPlugins(): Promise<PluginListResponse> {
  return fetchApi<PluginListResponse>('/plugins')
}

export async function getPlugin(pluginId: string): Promise<Plugin> {
  return fetchApi<Plugin>('/plugins/' + pluginId)
}

export async function getRecipeSpecification(
  pluginId: string
): Promise<RecipeSpecification> {
  return fetchApi<RecipeSpecification>(
    '/plugins/' + pluginId + '/recipe-specification'
  )
}

export async function checkPluginInstalled(
  pluginId: string,
  publicKey: string,
  authToken: string
): Promise<boolean> {
  try {
    await fetchApiWithAuth(
      '/vault/exist/' + pluginId + '/' + publicKey,
      authToken
    )
    return true
  } catch (err) {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase()
    if (msg.includes('status 404') || msg.includes('not found')) {
      return false
    }
    throw err
  }
}

export async function uninstallPlugin(
  pluginId: string,
  authToken: string
): Promise<void> {
  await fetchApiWithAuth('/plugin/' + pluginId, authToken, {
    method: 'DELETE',
    body: JSON.stringify({}),
  })
}

export async function listPolicies(
  pluginId: string,
  publicKey: string,
  authToken: string,
  active: boolean
): Promise<PolicyListResponse> {
  const url = `/plugin/policies/${pluginId}?public_key=${publicKey}&active=${active}`
  return fetchApiWithAuth<PolicyListResponse>(url, authToken)
}

export async function getPolicyFull(
  policyId: string,
  authToken: string
): Promise<Policy> {
  return fetchApiWithAuth<Policy>('/plugin/policy/' + policyId, authToken)
}

export async function getTransactions(
  publicKey: string,
  authToken: string
): Promise<TransactionListResponse> {
  return fetchApiWithAuth<TransactionListResponse>(
    '/plugin/transactions?public_key=' + publicKey,
    authToken
  )
}

type PolicySuggest = {
  rules?: unknown[]
  rate_limit_window?: number
  max_txs_per_window?: number
}

export async function suggestPolicy(
  pluginId: string,
  config: Record<string, unknown>
): Promise<PolicySuggest> {
  try {
    return await fetchApi<PolicySuggest>('/plugin/policy/suggest/' + pluginId, {
      method: 'POST',
      body: JSON.stringify(config),
    })
  } catch {
    return {}
  }
}

type PolicyAddRequest = {
  pluginId: string
  publicKey: string
  pluginVersion: string
  policyVersion: number
  signature: string
  recipe: string
  billing: unknown[]
  active: boolean
}

type PolicyAddResponse = {
  id: string
}

export async function addPolicy(
  req: PolicyAddRequest,
  authToken: string
): Promise<PolicyAddResponse> {
  return fetchApiWithAuth<PolicyAddResponse>('/plugin/policy', authToken, {
    method: 'POST',
    body: JSON.stringify({
      plugin_id: req.pluginId,
      public_key: req.publicKey,
      plugin_version: req.pluginVersion,
      policy_version: req.policyVersion,
      signature: req.signature,
      recipe: req.recipe,
      billing: req.billing,
      active: req.active,
    }),
  })
}

export async function deletePolicy(
  policyId: string,
  signature: string,
  authToken: string
): Promise<void> {
  await fetchApiWithAuth('/plugin/policy/' + policyId, authToken, {
    method: 'DELETE',
    body: JSON.stringify({ signature }),
  })
}

type VerifierReshareParams = {
  name: string
  publicKey: string
  sessionId: string
  hexEncryptionKey: string
  hexChainCode: string
  localPartyId: string
  oldParties: string[]
  oldResharePrefix: string
  libType: number
  pluginId: string
  relayUrl: string
}

export async function requestVerifierReshare(
  params: VerifierReshareParams,
  authToken: string
): Promise<void> {
  await fetchApiWithAuth('/vault/reshare', authToken, {
    method: 'POST',
    body: JSON.stringify({
      name: params.name,
      public_key: params.publicKey,
      session_id: params.sessionId,
      hex_encryption_key: params.hexEncryptionKey,
      hex_chain_code: params.hexChainCode,
      local_party_id: params.localPartyId,
      old_parties: params.oldParties,
      old_reshare_prefix: params.oldResharePrefix,
      lib_type: params.libType,
      email: '',
      plugin_id: params.pluginId,
      use_vultisig_relay: true,
      relay_url: params.relayUrl,
      relay_server: params.relayUrl,
    }),
  })
}

type AuthTokenPairResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
}

export async function authenticate(
  publicKey: string,
  chainCodeHex: string,
  signature: string,
  message: string
): Promise<AuthTokenPairResponse> {
  return fetchApi<AuthTokenPairResponse>('/auth', {
    method: 'POST',
    body: JSON.stringify({
      message,
      signature,
      chain_code_hex: chainCodeHex,
      public_key: publicKey,
    }),
  })
}

export async function refreshAuthToken(
  refreshToken: string
): Promise<AuthTokenPairResponse> {
  return fetchApi<AuthTokenPairResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

export async function validateToken(accessToken: string): Promise<void> {
  await fetchApiWithAuth('/auth/me', accessToken)
}

export async function revokeAllTokens(accessToken: string): Promise<void> {
  await fetchApiWithAuth('/auth/tokens/all', accessToken, {
    method: 'DELETE',
    body: JSON.stringify({}),
  })
}

export type {
  AppPricing,
  Plugin,
  PluginListResponse,
  Policy,
  PolicyListResponse,
  PolicySuggest,
  RecipeSpecification,
  Transaction,
  TransactionListResponse,
}
