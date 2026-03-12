import { attempt, withFallback } from '@lib/utils/attempt'
import { z } from 'zod'

import { verifierUrl } from '../../config'

const verifierBaseUrl = verifierUrl

type ApiResponse<T> = {
  data?: T
  error?: { message: string; code?: string }
}

const appPricingSchema = z
  .object({
    id: z.string(),
    pluginId: z.string(),
    amount: z.number(),
    asset: z.string(),
    type: z.string(),
    frequency: z.string(),
    metric: z.string(),
  })
  .passthrough()

const pluginSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    logo: z.string().optional(),
    categories: z.array(z.string()).optional(),
    version: z.string().optional(),
    plugin_version: z.string().optional(),
    author: z.string().optional(),
    pricing: z.array(appPricingSchema).optional(),
  })
  .passthrough()

const pluginListResponseSchema = z
  .object({
    plugins: z.array(pluginSchema),
    total_count: z.number(),
  })
  .passthrough()

const recipeSpecificationSchema = z
  .object({
    description: z.string(),
    configuration_schema: z.record(z.string(), z.unknown()),
    configuration_example: z.unknown().optional(),
    supported_chains: z.array(z.string()).optional(),
    supported_assets: z.array(z.string()).optional(),
    required_fields: z.array(z.string()).optional(),
  })
  .passthrough()

const policySchema = z
  .object({
    id: z.string(),
    plugin_id: z.string(),
    public_key: z.string(),
    name: z.string().optional(),
    active: z.boolean(),
    configuration: z.record(z.string(), z.unknown()),
    recipe: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string().optional(),
  })
  .passthrough()

const policyListResponseSchema = z
  .object({
    policies: z.array(policySchema),
    total_count: z.number(),
  })
  .passthrough()

const transactionSchema = z
  .object({
    id: z.string(),
    policy_id: z.string(),
    tx_hash: z.string(),
    status: z.string(),
    status_onchain: z.string().optional(),
    created_at: z.string(),
  })
  .passthrough()

const transactionListResponseSchema = z
  .object({
    history: z.array(transactionSchema),
    total_count: z.number(),
  })
  .passthrough()

const policySuggestSchema = z
  .object({
    rules: z.array(z.unknown()).optional(),
    rate_limit_window: z.number().optional(),
    max_txs_per_window: z.number().optional(),
  })
  .passthrough()

const policyAddResponseSchema = z
  .object({
    id: z.string(),
  })
  .passthrough()

const authTokenPairResponseSchema = z
  .object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number(),
  })
  .passthrough()

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
  options: RequestInit = {},
  schema?: z.ZodType<T>
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

  const parsed = withFallback(
    attempt(() => JSON.parse(body) as ApiResponse<T>),
    null
  )

  let result: unknown

  if (!parsed) {
    result = JSON.parse(body)
  } else if (parsed.error?.message) {
    throw new Error(`API error: ${parsed.error.message}`)
  } else if (parsed.data !== undefined) {
    result = parsed.data
  } else {
    result = parsed
  }

  if (schema) {
    return schema.parse(result)
  }

  return result as T
}

async function fetchApiWithAuth<T>(
  path: string,
  authToken: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  return fetchApi<T>(
    path,
    {
      ...options,
      headers: {
        ...options.headers,
        ...(authToken ? { Authorization: bearerAuth(authToken) } : {}),
      },
    },
    schema
  )
}

export async function listPlugins(): Promise<PluginListResponse> {
  return fetchApi<PluginListResponse>('/plugins', {}, pluginListResponseSchema)
}

export async function getPlugin(pluginId: string): Promise<Plugin> {
  return fetchApi<Plugin>(
    '/plugins/' + encodeURIComponent(pluginId),
    {},
    pluginSchema
  )
}

export async function getRecipeSpecification(
  pluginId: string
): Promise<RecipeSpecification> {
  return fetchApi<RecipeSpecification>(
    '/plugins/' + encodeURIComponent(pluginId) + '/recipe-specification',
    {},
    recipeSpecificationSchema
  )
}

export async function checkPluginInstalled(
  pluginId: string,
  publicKey: string,
  authToken: string
): Promise<boolean> {
  const result = await attempt(() =>
    fetchApiWithAuth(
      '/vault/exist/' +
        encodeURIComponent(pluginId) +
        '/' +
        encodeURIComponent(publicKey),
      authToken
    )
  )

  if ('error' in result) {
    const msg = (
      result.error instanceof Error
        ? result.error.message
        : String(result.error)
    ).toLowerCase()
    if (msg.includes('status 404') || msg.includes('not found')) {
      return false
    }
    throw result.error
  }

  return true
}

export async function uninstallPlugin(
  pluginId: string,
  authToken: string
): Promise<void> {
  await fetchApiWithAuth('/plugin/' + encodeURIComponent(pluginId), authToken, {
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
  const params = new URLSearchParams({
    public_key: publicKey,
    active: String(active),
  })
  const url = `/plugin/policies/${encodeURIComponent(pluginId)}?${params}`
  return fetchApiWithAuth<PolicyListResponse>(
    url,
    authToken,
    {},
    policyListResponseSchema
  )
}

export async function getPolicyFull(
  policyId: string,
  authToken: string
): Promise<Policy> {
  return fetchApiWithAuth<Policy>(
    '/plugin/policy/' + encodeURIComponent(policyId),
    authToken,
    {},
    policySchema
  )
}

export async function getTransactions(
  publicKey: string,
  authToken: string
): Promise<TransactionListResponse> {
  return fetchApiWithAuth<TransactionListResponse>(
    '/plugin/transactions?public_key=' + encodeURIComponent(publicKey),
    authToken,
    {},
    transactionListResponseSchema
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
  return withFallback(
    attempt(() =>
      fetchApi<PolicySuggest>(
        '/plugin/policy/suggest/' + encodeURIComponent(pluginId),
        {
          method: 'POST',
          body: JSON.stringify(config),
        },
        policySuggestSchema
      )
    ),
    {}
  )
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
  return fetchApiWithAuth<PolicyAddResponse>(
    '/plugin/policy',
    authToken,
    {
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
    },
    policyAddResponseSchema
  )
}

export async function deletePolicy(
  policyId: string,
  signature: string,
  authToken: string
): Promise<void> {
  await fetchApiWithAuth(
    '/plugin/policy/' + encodeURIComponent(policyId),
    authToken,
    {
      method: 'DELETE',
      body: JSON.stringify({ signature }),
    }
  )
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

export async function authenticate(params: {
  publicKey: string
  chainCodeHex: string
  signature: string
  message: string
}): Promise<AuthTokenPairResponse> {
  const { publicKey, chainCodeHex, signature, message } = params
  return fetchApi<AuthTokenPairResponse>(
    '/auth',
    {
      method: 'POST',
      body: JSON.stringify({
        message,
        signature,
        chain_code_hex: chainCodeHex,
        public_key: publicKey,
      }),
    },
    authTokenPairResponseSchema
  )
}

export async function refreshAuthToken(
  refreshToken: string
): Promise<AuthTokenPairResponse> {
  return fetchApi<AuthTokenPairResponse>(
    '/auth/refresh',
    {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
    authTokenPairResponseSchema
  )
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

export type { AppPricing, Policy }
