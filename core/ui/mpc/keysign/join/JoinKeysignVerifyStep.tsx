import { isChainOfKind } from '@core/chain/ChainKind'
import { getKeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { KeysignCustomMessageInfo } from '@core/ui/mpc/keysign/custom/KeysignCustomMessageInfo'
import { JoinKeysignBlockaidVerify } from '@core/ui/mpc/keysign/join/tx/JoinKeysignBlockaidVerify'
import { JoinKeysignPsbtVerify } from '@core/ui/mpc/keysign/join/tx/JoinKeysignPsbtVerify'
import { JoinKeysignSwapVerify } from '@core/ui/mpc/keysign/join/tx/JoinKeysignSwapVerify'
import { JoinKeysignTxPrimaryInfo } from '@core/ui/mpc/keysign/join/tx/JoinKeysignTxPrimaryInfo'
import { JoinKeysignUtxoAmountVerify } from '@core/ui/mpc/keysign/join/tx/JoinKeysignUtxoAmountVerify'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { Button } from '@lib/ui/buttons/Button'
import { WithProgressIndicator } from '@lib/ui/flow/WithProgressIndicator'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { assertField } from '@lib/utils/record/assertField'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const JoinKeysignVerifyStep = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const [{ keysignMsg }] = useCoreViewState<'joinKeysign'>()

  const keysignPayload = useMemo(
    () => getKeysignMessagePayload(keysignMsg),
    [keysignMsg]
  )

  const renderKeysignPayload = (payload: KeysignPayload) => {
    if (payload.swapPayload?.value) {
      return <JoinKeysignSwapVerify value={payload} />
    }
    if (payload.signData?.case === 'signPsbt') {
      return (
        <TxOverviewPanel>
          <JoinKeysignPsbtVerify value={payload} />
        </TxOverviewPanel>
      )
    }
    const coin = fromCommCoin(assertField(payload, 'coin'))
    if (isChainOfKind(coin.chain, 'utxo')) {
      return (
        <TxOverviewPanel>
          <JoinKeysignUtxoAmountVerify value={payload} />
        </TxOverviewPanel>
      )
    }
    if (isChainOfKind(coin.chain, 'evm')) {
      return (
        <TxOverviewPanel>
          <JoinKeysignBlockaidVerify value={payload} />
        </TxOverviewPanel>
      )
    }
    return (
      <TxOverviewPanel>
        <JoinKeysignTxPrimaryInfo value={payload} />
      </TxOverviewPanel>
    )
  }

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('verify')}
        hasBorder
      />
      <PageContent>
        <WithProgressIndicator value={0.6}>
          <MatchRecordUnion
            value={keysignPayload}
            handlers={{
              keysign: payload => renderKeysignPayload(payload),
              custom: value => (
                <TxOverviewPanel>
                  <KeysignCustomMessageInfo value={value} />
                </TxOverviewPanel>
              ),
            }}
          />
        </WithProgressIndicator>
        <Button onClick={onFinish}>{t('join_keysign')}</Button>
      </PageContent>
    </>
  )
}
