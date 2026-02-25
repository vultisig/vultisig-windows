import { getBlockaidTxValidationInput } from '@core/chain/security/blockaid/tx/validation/input'
import { BuildKeysignPayloadError } from '@core/mpc/keysign/error'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getBlockaidTxValidationQuery } from '@core/ui/chain/security/blockaid/tx/queries/blockaidTxValidation'
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
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { match } from '@lib/utils/match'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { BlockaidNoScanStatus } from '../../../chain/security/blockaid/scan/BlockaidNoScanStatus'
import { BlockaidScanning } from '../../../chain/security/blockaid/scan/BlockaidScanning'
import { BlockaidScanStatusContainer } from '../../../chain/security/blockaid/scan/BlockaidScanStatusContainer'
import { BlockaidTxValidationResult } from '../../../chain/security/blockaid/tx/BlockaidTxValidationResult'

type VerifyKeysignStartInput = {
  children: ReactNode
  keysignPayloadQuery: Query<KeysignPayload>
  terms?: string[]
}

const TermItem = styled(Checkbox)`
  ${verticalPadding(10)}
  font-family: inherit;
  font-size: 14px;
`

export const VerifyKeysignStart = ({
  children,
  keysignPayloadQuery,
  terms = [],
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
  console.log('txScanInput', txScanInput.data)

  const txScanQuery = usePotentialQuery(
    txScanInput.data || undefined,
    getBlockaidTxValidationQuery
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

    if (keysignPayloadQuery.error) {
      if (keysignPayloadQuery.error instanceof BuildKeysignPayloadError) {
        return {
          disabledMessage: match(keysignPayloadQuery.error.type, {
            'not-enough-funds': () => t('not_enough_funds'),
          }),
        }
      }
      return {
        disabledMessage: extractErrorMsg(keysignPayloadQuery.error),
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
    keysignPayloadQuery.error,
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
            success={value => <BlockaidTxValidationResult value={value} />}
            pending={() => <BlockaidScanning />}
            error={() => <BlockaidNoScanStatus entity="tx" />}
            inactive={() => <BlockaidScanStatusContainer />}
          />
        )}

        {children}

        {terms.length > 0 && (
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
        )}

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
