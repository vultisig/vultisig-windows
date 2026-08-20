import { Chain } from '@vultisig/core-chain/Chain'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { chainToThornameAlias } from './chainToThornameAlias'
import { NameServiceSuffix } from './NameServiceName'

type NameServiceAliases = {
  aliases: { chain: string; address: string }[]
}

const nameServiceBaseUrl: Record<NameServiceSuffix, string> = {
  '.thor': `${cosmosRpcUrl.THORChain}/thorchain`,
  '.maya': `${cosmosRpcUrl.MayaChain}/mayachain`,
}

const nameServiceEndpoint: Record<NameServiceSuffix, string> = {
  '.thor': 'thorname',
  '.maya': 'mayaname',
}

type ResolveNameServiceInput = {
  name: string
  suffix: NameServiceSuffix
  chain: Chain
}

/**
 * Resolves a `.thor` or `.maya` name to the registered address for the given chain.
 * Returns the address string or throws if the name doesn't exist or has no
 * alias registered for the target chain.
 */
export const resolveNameService = async ({
  name,
  suffix,
  chain,
}: ResolveNameServiceInput): Promise<string> => {
  const baseUrl = nameServiceBaseUrl[suffix]
  const endpoint = nameServiceEndpoint[suffix]

  const trimmedName = name.trim().toLowerCase()
  const baseName = trimmedName.slice(0, -suffix.length)

  const data = await queryUrl<NameServiceAliases>(
    `${baseUrl}/${endpoint}/${baseName}`
  )

  const thornameAlias = chainToThornameAlias[chain]
  if (!thornameAlias) {
    throw new Error(`Chain "${chain}" is not supported by ${suffix} names`)
  }

  const match = data.aliases.find(
    a => a.chain.toUpperCase() === thornameAlias.toUpperCase()
  )

  if (!match?.address) {
    throw new Error(
      `Name "${trimmedName}" has no address registered for ${chain}`
    )
  }

  return match.address
}
