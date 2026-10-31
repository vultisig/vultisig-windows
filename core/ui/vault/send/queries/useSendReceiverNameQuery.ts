import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { resolveNameServiceName } from '@vultisig/core-chain/nameService'
import { NameServiceName } from '@vultisig/core-chain/nameService/getNameServiceName'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

type UseSendReceiverNameQueryInput = {
  name: NameServiceName | null
  chain: Chain
  /** False while the receiver is still being typed. */
  enabled: boolean
}

/**
 * Looks a receiver name up for the selected chain. Keyed on the chain, so a
 * chain switch never reuses an address resolved for another chain, and not
 * refetched in the background, so the address Verify signs cannot change
 * under it.
 */
export const useSendReceiverNameQuery = ({
  name,
  chain,
  enabled,
}: UseSendReceiverNameQueryInput) =>
  useQuery({
    queryKey: ['sendReceiverName', name, chain],
    queryFn: () =>
      resolveNameServiceName({
        ...shouldBePresent(name, 'receiver name'),
        chain,
      }),
    enabled: enabled && name !== null,
    retry: 1,
    ...noRefetchQueryOptions,
  })
