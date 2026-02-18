const verifierBaseUrl = 'https://verifier.vultisig.com'

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

export type {
  AppPricing,
  Plugin,
  PluginListResponse,
  Policy,
  PolicyListResponse,
  RecipeSpecification,
  Transaction,
  TransactionListResponse,
}
