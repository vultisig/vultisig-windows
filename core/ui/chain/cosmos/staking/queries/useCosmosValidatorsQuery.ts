import { useQuery } from '@tanstack/react-query'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'

export type Validator = {
  operatorAddress: string
  jailed: boolean
  status: string
  tokens: string
  description: {
    moniker: string
    identity: string
    website?: string
    securityContact?: string
    details?: string
  }
  commission: {
    rate: string
  }
}

type RawValidator = {
  operator_address: string
  jailed: boolean
  status: string
  tokens: string
  description: {
    moniker: string
    identity: string
    website?: string
    security_contact?: string
    details?: string
  }
  commission?: {
    commission_rates?: {
      rate?: string
    }
  }
}

type FetchOpts = {
  fetchImpl?: typeof fetch
  signal?: AbortSignal
}

type GetCosmosValidatorsOptions = FetchOpts & {
  status?: string
}

const getValidatorsUrl = (
  chain: IbcEnabledCosmosChain,
  status: string | undefined
) => {
  const url = new URL(
    `${cosmosRpcUrl[chain]}/cosmos/staking/v1beta1/validators`
  )
  if (status !== undefined) {
    url.searchParams.set('status', status)
  }

  return url.toString()
}

const normalizeValidator = (validator: RawValidator): Validator => ({
  operatorAddress: validator.operator_address,
  jailed: validator.jailed,
  status: validator.status,
  tokens: validator.tokens,
  description: {
    moniker: validator.description.moniker,
    identity: validator.description.identity,
    website: validator.description.website,
    securityContact: validator.description.security_contact,
    details: validator.description.details,
  },
  commission: {
    rate: validator.commission?.commission_rates?.rate ?? '0',
  },
})

const getCosmosValidators = async (
  chain: IbcEnabledCosmosChain,
  { fetchImpl, signal, status }: GetCosmosValidatorsOptions = {}
): Promise<Validator[]> => {
  const f = fetchImpl ?? fetch
  const url = getValidatorsUrl(chain, status)
  const response = await f(url, { signal })

  if (!response.ok) {
    throw new Error(`LCD ${response.status}: ${url}`)
  }

  const data: { validators: RawValidator[] } = await response.json()

  return data.validators.map(normalizeValidator)
}

/**
 * Lists the full validator set for the chain. Defaults to bonded validators
 * only — the typical case for the delegate / redelegate picker UI. Pass
 * `status: undefined` to include unbonding / unbonded entries as well.
 */
export const useCosmosValidatorsQuery = (
  chain: IbcEnabledCosmosChain | undefined
) =>
  useQuery({
    queryKey: ['cosmosValidators', chain ?? '', 'bonded'] as const,
    queryFn: ({ signal }) => {
      if (chain === undefined) {
        throw new Error('Cosmos validators query requires a chain')
      }

      return getCosmosValidators(chain, {
        status: 'BOND_STATUS_BONDED',
        signal,
      })
    },
    enabled: chain !== undefined,
    staleTime: 60_000,
  })
