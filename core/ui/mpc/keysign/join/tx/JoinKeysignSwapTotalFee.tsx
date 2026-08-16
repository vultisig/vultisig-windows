import { useKeysignFee } from '@core/ui/mpc/keysign/fee/useKeysignFee'
import { SwapFeeFiatValue } from '@core/ui/vault/swap/form/info/SwapTotalFeeFiatValue'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useTranslation } from 'react-i18next'

type JoinKeysignSwapTotalFeeProps = {
  keysignPayload: KeysignPayload
  swapFee: SwapFee
}

/**
 * The whole cost of a swap to the signer: source-chain gas plus the swap fee the
 * payload carries, valued through the same price lookup the initiator's total
 * uses so both devices arrive at one figure.
 *
 * Callers must only render this where the payload actually carries a swap fee.
 * A total summed over gas alone would understate the cost by the larger of the
 * two amounts, on the one screen whose job is to show a co-signer what they are
 * about to approve.
 */
export const JoinKeysignSwapTotalFee = ({
  keysignPayload,
  swapFee,
}: JoinKeysignSwapTotalFeeProps) => {
  const { t } = useTranslation()
  const feeCoin = chainFeeCoin[getKeysignChain(keysignPayload)]
  const feeQuery = useKeysignFee(keysignPayload)

  return (
    <MatchQuery
      value={feeQuery}
      pending={() => <Spinner />}
      // A blank total reads as "nothing to pay" rather than "not known", so the
      // failure has to say so in words.
      error={() => <Text color="shy">{t('failed_to_load')}</Text>}
      success={feeAmount => (
        <SwapFeeFiatValue
          value={[
            { ...feeCoin, amount: feeAmount, decimals: feeCoin.decimals },
            swapFee,
          ]}
        />
      )}
    />
  )
}
