import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/mpc/keysign/fee'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'

import { useCoinPriceQuery } from '../../../chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '../../../chain/hooks/useFormatFiatAmount'
import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useCurrentVaultPublicKey } from '../../../vault/state/currentVault'

type KeysignFeeAmountProps = {
  keysignPayload: KeysignPayload
}

export const KeysignFeeAmount = ({ keysignPayload }: KeysignFeeAmountProps) => {
  const formatFiatAmount = useFormatFiatAmount()
  const chain = getKeysignChain(keysignPayload)

  const { decimals, ticker } = chainFeeCoin[chain]

  const feeCoinPriceQuery = useCoinPriceQuery({ coin: chainFeeCoin[chain] })

  const publicKey = useCurrentVaultPublicKey(chain)

  const walletCore = useAssertWalletCore()

  const fee = fromChainAmount(
    getFeeAmount({ keysignPayload, walletCore, publicKey }),
    decimals
  )

  return (
    <VStack alignItems="flex-start">
      <Text size={14}>{formatAmount(fee, { ticker })}</Text>
      <Text size={14} color="shy">
        <MatchQuery
          value={feeCoinPriceQuery}
          pending={() => <Spinner />}
          success={price => formatFiatAmount(fee * price)}
        />
      </Text>
    </VStack>
  )
}
