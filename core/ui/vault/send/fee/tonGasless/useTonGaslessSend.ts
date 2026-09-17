import { useTonGaslessConfigQuery } from '@core/ui/chain/ton/gasless/queries/useTonGaslessConfigQuery'
import { useTonWalletVersion } from '@core/ui/storage/tonW5Enabled'
import { useSendBalanceQuery } from '@core/ui/vault/send/queries/useSendBalanceQuery'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { useSendTonGaslessPreference } from '@core/ui/vault/send/state/tonGasless'
import { Chain } from '@vultisig/core-chain/Chain'
import { isTonGasJetton } from '@vultisig/core-chain/chains/ton/gasless/api'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { getTonFeeAmount } from '@vultisig/core-mpc/keysign/fee/resolvers/ton'

type TonGaslessSend = {
  /** The relay takes this jetton as a fee and the account is a W5 wallet. */
  isAvailable: boolean
  /** Whether this send will go through the relay. Never true when unavailable. */
  isEnabled: boolean
  /** Availability is still being looked up. */
  isPending: boolean
  setEnabled: (value: boolean) => void
}

/**
 * Whether the current send can pay its fee in the jetton being sent through the
 * gasless relay, and whether it will. Gasless is a W5 feature for jettons the
 * relay lists. Until the user touches the switch it defaults to on exactly when
 * the account's TON cannot cover a direct send's fee — the case the feature
 * exists for — and to off otherwise, so an account that holds TON keeps paying
 * in TON unless asked.
 */
export const useTonGaslessSend = (): TonGaslessSend => {
  const coin = useCurrentSendCoin()
  const tonWalletVersion = useTonWalletVersion()
  const [preference, setEnabled] = useSendTonGaslessPreference()

  const isCandidate =
    coin.chain === Chain.Ton && !isFeeCoin(coin) && tonWalletVersion === 'v5r1'

  const configQuery = useTonGaslessConfigQuery({ enabled: isCandidate })
  const nativeBalanceQuery = useSendBalanceQuery(
    extractAccountCoinKey({
      ...chainFeeCoin[coin.chain],
      address: coin.address,
    })
  )

  const isAvailable =
    isCandidate &&
    !!coin.id &&
    !!configQuery.data &&
    isTonGasJetton(configQuery.data, coin.id)

  const nativeBalance = nativeBalanceQuery.data
  const defaultEnabled =
    nativeBalance != null && nativeBalance < getTonFeeAmount(coin)

  return {
    isAvailable,
    isEnabled: isAvailable && (preference ?? defaultEnabled),
    isPending: isCandidate && configQuery.isPending,
    setEnabled,
  }
}
