import { getDeveloperOptions } from '@core/extension/storage/developerOptions'
import { queryUrl } from '@lib/utils/query/queryUrl'

type Input = {
  email: string
  hex_chain_code: string
  hex_encryption_key: string
  local_party_id: string
  name: string
  old_parties: string[]
  plugin_id: string
  public_key: string
  session_id: string
}

export const reshareWithVerifier = async (input: Input) => {
  const { pluginMarketplaceBaseUrl } = await getDeveloperOptions()
  queryUrl(`${pluginMarketplaceBaseUrl}/vault/reshare`, {
    body: input,
    responseType: 'none',
    headers: {
      Authorization: `Bearer `,
    },
  })
}
