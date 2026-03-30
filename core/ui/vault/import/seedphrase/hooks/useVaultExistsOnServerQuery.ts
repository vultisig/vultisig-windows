import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { checkVaultExistsOnServer } from '@vultisig/core-mpc/fast/api/checkVaultExistsOnServer'

type UseVaultExistsOnServerQueryInput = {
  ecdsaPublicKey: string | null
}

/** Checks if a vault with the given ECDSA public key already exists on the server. */
export const useVaultExistsOnServerQuery = ({
  ecdsaPublicKey,
}: UseVaultExistsOnServerQueryInput) => {
  return useQuery({
    queryKey: ['vaultExistsOnServer', ecdsaPublicKey],
    queryFn: () => checkVaultExistsOnServer(ecdsaPublicKey!),
    enabled: ecdsaPublicKey !== null,
    ...noRefetchQueryOptions,
  })
}
