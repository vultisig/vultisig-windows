import { getBlockaidTxValidationInput } from '@core/chain/security/blockaid/tx/input'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getBlockaidTxScanQuery } from '@core/ui/chain/security/blockaid/tx/queries/blockaidTxScan'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/prompt/StartKeysignPrompt'
import { StartKeysignPromptProps } from '@core/ui/mpc/keysign/prompt/StartKeysignPromptProps'
import { useIsBlockaidEnabled } from '@core/ui/storage/blockaid'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { Query } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { BlockaidNoScanStatus } from '../../../chain/security/blockaid/scan/BlockaidNoScanStatus'
import { BlockaidScanning } from '../../../chain/security/blockaid/scan/BlockaidScanning'
import { BlockaidScanStatusContainer } from '../../../chain/security/blockaid/scan/BlockaidScanStatusContainer'
import { BlockaidTxScanResult } from '../../../chain/security/blockaid/tx/BlockaidTxScanResult'

type VerifyKeysignStartInput = {
  children: ReactNode
  keysignPayloadQuery: Query<KeysignPayload>
  terms: string[]
}

const TermItem = styled(Checkbox)`
  ${verticalPadding(10)}
  font-family: inherit;
  font-size: 14px;
`

export const VerifyKeysignStart = ({
  children,
  keysignPayloadQuery,
  terms,
}: VerifyKeysignStartInput) => {
  const { t } = useTranslation()
  const isBlockaidEnabled = useIsBlockaidEnabled()

  const [termsAccepted, setTermsAccepted] = useState<boolean[]>(
    new Array(terms.length).fill(false)
  )

  const walletCore = useAssertWalletCore()

  const txScanInput = useTransformQueryData(
    keysignPayloadQuery,
    useCallback(
      payload => {
        if (!isBlockaidEnabled) {
          return null
        }

        return getBlockaidTxValidationInput({
          payload,
          walletCore,
        })
      },
      [isBlockaidEnabled, walletCore]
    )
  )

  const txScanQuery = usePotentialQuery(
    txScanInput.data || undefined,
    getBlockaidTxScanQuery
  )

  const startKeysignPromptProps: StartKeysignPromptProps = useMemo(() => {
    if (termsAccepted.some(term => !term)) {
      return {
        disabledMessage: t('terms_required'),
      }
    }

    if (txScanQuery.isPending) {
      return {
        disabledMessage: t('scanning'),
      }
    }

    if (keysignPayloadQuery.isPending) {
      return {
        disabledMessage: t('loading'),
      }
    }

    const keysign = keysignPayloadQuery.data

    if (!keysign) {
      if (keysignPayloadQuery.isPending) {
        return {
          disabledMessage: t('loading'),
        }
      }
      return {}
    }

    return {
      keysignPayload: { keysign },
    }
  }, [
    keysignPayloadQuery.data,
    keysignPayloadQuery.isPending,
    t,
    termsAccepted,
    txScanQuery.isPending,
  ])

  return (
    <>
      <PageContent gap={12} scrollable>
        {isBlockaidEnabled && (
          <MatchQuery
            value={txScanQuery}
            success={value => <BlockaidTxScanResult value={value} />}
            pending={() => <BlockaidScanning />}
            error={() => <BlockaidNoScanStatus entity="tx" />}
            inactive={() => <BlockaidScanStatusContainer />}
          />
        )}

        {children}

        <VStack>
          {terms.map((term, index) => (
            <TermItem
              key={index}
              label={<Text size={14}>{term}</Text>}
              value={termsAccepted[index]}
              onChange={v =>
                setTermsAccepted(prev => updateAtIndex(prev, index, () => v))
              }
            />
          ))}
        </VStack>

        <VStack
          style={{
            marginTop: 'auto',
          }}
          gap={20}
        >
          <StartKeysignPrompt {...startKeysignPromptProps} />
        </VStack>
      </PageContent>
    </>
  )
}
