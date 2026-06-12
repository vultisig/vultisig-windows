import { getNonNativeDappCosmosFeeDisplay } from '@core/inpage-provider/popup/view/resolvers/sendTx/keysignPayload/dappCosmosFee'
import { ManageEvmFee } from '@core/inpage-provider/popup/view/resolvers/sendTx/ManageEvmFee'
import { usePopupInput } from '@core/inpage-provider/popup/view/state/input'
import { useKeysignFee } from '@core/ui/mpc/keysign/fee/useKeysignFee'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { CosmosMsgType } from '@vultisig/core-chain/chains/cosmos/cosmosMsgTypes'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { FeeSettings } from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'
import { getBlockchainSpecificValue } from '@vultisig/core-mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const DappCosmosFeeDescription = styled.span`
  color: ${getColor('textShy')};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  overflow-wrap: anywhere;
`

export type NetworkFeeSectionProps = {
  keysignPayload: KeysignPayload
  transactionPayload: ReturnType<typeof usePopupInput<'sendTx'>>
  chain: Chain
  feeSettings: FeeSettings<'evm'> | null
  setFeeSettings: (settings: FeeSettings<'evm'> | null) => void
}

export const NetworkFeeSection = ({
  keysignPayload,
  transactionPayload,
  chain,
  feeSettings,
  setFeeSettings,
}: NetworkFeeSectionProps) => {
  const { t } = useTranslation()
  const feeAmountQuery = useKeysignFee(keysignPayload)

  return (
    <MatchRecordUnion
      value={transactionPayload}
      handlers={{
        keysign: transactionPayload => {
          const nonNativeDappCosmosFeeDisplay = isChainOfKind(chain, 'cosmos')
            ? getNonNativeDappCosmosFeeDisplay({
                keysignPayload,
                chain,
              })
            : null

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
                description={
                  nonNativeDappCosmosFeeDisplay ? (
                    <DappCosmosFeeDescription>
                      {nonNativeDappCosmosFeeDisplay}
                    </DappCosmosFeeDescription>
                  ) : feeAmountQuery.data === undefined ? null : (
                    formatAmount(
                      fromChainAmount(
                        feeAmountQuery.data,
                        chainFeeCoin[chain].decimals
                      ),
                      chainFeeCoin[chain]
                    )
                  )
                }
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
                title={t(
                  nonNativeDappCosmosFeeDisplay
                    ? 'network_fee'
                    : 'est_network_fee'
                )}
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
