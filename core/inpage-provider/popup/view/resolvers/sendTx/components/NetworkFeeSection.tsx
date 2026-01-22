import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { CosmosMsgType } from '@core/chain/chains/cosmos/cosmosMsgTypes'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { ManageEvmFee } from '@core/inpage-provider/popup/view/resolvers/sendTx/ManageEvmFee'
import { usePopupInput } from '@core/inpage-provider/popup/view/state/input'
import { FeeSettings } from '@core/mpc/keysign/chainSpecific/FeeSettings'
import { getBlockchainSpecificValue } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { getFeeAmount } from '@core/mpc/keysign/fee'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVaultPublicKey } from '@core/ui/vault/state/currentVault'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'

export type NetworkFeeSectionProps = {
  keysignPayload: KeysignPayload
  transactionPayload: ReturnType<typeof usePopupInput<'sendTx'>>
  chain: Chain
  feeSettings: FeeSettings<'evm'> | null
  setFeeSettings: (settings: FeeSettings<'evm'> | null) => void
  walletCore: ReturnType<typeof useAssertWalletCore>
  publicKey: ReturnType<typeof useCurrentVaultPublicKey>
}

export const NetworkFeeSection = ({
  keysignPayload,
  transactionPayload,
  chain,
  feeSettings,
  setFeeSettings,
  walletCore,
  publicKey,
}: NetworkFeeSectionProps) => {
  const { t } = useTranslation()

  return (
    <MatchRecordUnion
      value={transactionPayload}
      handlers={{
        keysign: transactionPayload => {
          const feeAmount = getFeeAmount({
            keysignPayload,
            walletCore,
            publicKey,
          })

          const getEvmValues = () => {
            if (!isChainOfKind(chain, 'evm')) {
              return null
            }

            const evmSpecific = getBlockchainSpecificValue(
              keysignPayload.blockchainSpecific,
              'ethereumSpecific'
            )

            const baseFee =
              BigInt(evmSpecific.maxFeePerGasWei) -
              BigInt(evmSpecific.priorityFee)

            return {
              settings: feeSettings || {
                maxPriorityFeePerGas: BigInt(evmSpecific.priorityFee),
                gasLimit: BigInt(evmSpecific.gasLimit),
              },
              baseFee,
            }
          }

          const evmValues = getEvmValues()

          return (
            <List>
              <ListItem
                description={formatAmount(
                  fromChainAmount(feeAmount, chainFeeCoin[chain].decimals),
                  chainFeeCoin[chain]
                )}
                extra={
                  isChainOfKind(chain, 'evm') && evmValues ? (
                    <ManageEvmFee
                      value={evmValues.settings}
                      chain={chain}
                      onChange={setFeeSettings}
                      baseFee={evmValues.baseFee}
                    />
                  ) : null
                }
                title={t('est_network_fee')}
                hoverable={false}
              />
              {transactionPayload.transactionDetails.msgPayload?.case ===
                CosmosMsgType.MSG_EXECUTE_CONTRACT && (
                <ListItem
                  description={
                    transactionPayload.transactionDetails.msgPayload.value.msg
                  }
                  title={t('message')}
                  hoverable={false}
                />
              )}
            </List>
          )
        },
        serialized: () => null,
      }}
    />
  )
}
