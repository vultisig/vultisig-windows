import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { getKeysignSwapKitDepositRecipient } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapKitDepositRecipient'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useTranslation } from 'react-i18next'

import { SwapFeeRowRenderer } from '../../form/info/swapFeeRow'

type SwapDepositAddressRowProps = {
  renderRow: SwapFeeRowRenderer
  keysignPayload: KeysignPayload
}

/**
 * The address a SwapKit ERC-20 deposit sends the sold token to, decoded from
 * the calldata that gets signed, so the initiator and every co-signer see where
 * the funds go. Renders nothing for any other swap; a deposit the signer would
 * refuse says it cannot be verified instead of showing an address.
 */
export const SwapDepositAddressRow = ({
  renderRow,
  keysignPayload,
}: SwapDepositAddressRowProps) => {
  const { t } = useTranslation()
  const result = attempt(() =>
    getKeysignSwapKitDepositRecipient(keysignPayload)
  )

  if ('error' in result) {
    return (
      <>
        {renderRow({
          label: t('swap_deposit_address'),
          value: (
            <Text as="span" color="danger">
              {t('swap_deposit_address_unverifiable')}
            </Text>
          ),
        })}
      </>
    )
  }

  if (!result.data) return null

  return (
    <>
      {renderRow({
        label: t('swap_deposit_address'),
        value: (
          <MiddleTruncate text={result.data} flexGrow justifyContent="end" />
        ),
      })}
    </>
  )
}
