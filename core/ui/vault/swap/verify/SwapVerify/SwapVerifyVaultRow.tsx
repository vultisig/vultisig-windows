import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { SwapVerifyRow } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyRow'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { useTranslation } from 'react-i18next'

/**
 * The vault the swap signs from, named and addressed. Takes the sending
 * address rather than deriving one, so the row states the account the funds
 * actually leave instead of a vault-level default.
 */
export const SwapVerifyVaultRow = ({ value }: ValueProp<string>) => {
  const { t } = useTranslation()
  const { name } = useCurrentVault()

  return (
    <SwapVerifyRow
      label={t('vault')}
      value={
        <>
          {name}{' '}
          <Text as="span" color="shy">
            ({formatWalletAddress(value)})
          </Text>
        </>
      }
    />
  )
}
