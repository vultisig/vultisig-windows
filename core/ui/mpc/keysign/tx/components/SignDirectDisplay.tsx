import { SignDirect } from '@core/mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
import { AuthInfo, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { CSSProperties } from 'styled-components'

type Styles = {
  color: ThemeColor
  fontSize: NonNullable<CSSProperties['fontSize']>
}

const StyledTitle = styled.span<Styles>`
  color: ${({ color }) => getColor(color)};
  font-size: ${({ fontSize }) => toSizeUnit(fontSize)};
  font-weight: 500;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const SignDirectDisplay = ({
  signDirect,
}: {
  signDirect: SignDirect
}) => {
  const { t } = useTranslation()

  const displayData = useMemo(() => {
    try {
      const bodyBytes = fromBase64(signDirect.bodyBytes)
      const authInfoBytes = fromBase64(signDirect.authInfoBytes)
      const txBody = TxBody.decode(bodyBytes)
      const authInfo = AuthInfo.decode(authInfoBytes)

      const messages = txBody.messages.map(msg => ({
        typeUrl: msg.typeUrl,
        value: toBase64(msg.value),
      }))

      const fee = authInfo.fee
        ? {
            amount: authInfo.fee.amount.map(coin => ({
              denom: coin.denom,
              amount: coin.amount,
            })),
            gasLimit: authInfo.fee.gasLimit?.toString() ?? '0',
          }
        : undefined

      const signerInfo = authInfo.signerInfos[0]
      const sequence = signerInfo?.sequence?.toString() ?? '0'

      return {
        chainId: signDirect.chainId,
        accountNumber: signDirect.accountNumber,
        sequence,
        memo: txBody.memo,
        messages,
        fee,
      }
    } catch (error) {
      return {
        chainId: signDirect.chainId,
        accountNumber: signDirect.accountNumber,
        error: error instanceof Error ? error.message : 'Failed to decode',
        bodyBytes: signDirect.bodyBytes.substring(0, 100) + '...',
        authInfoBytes: signDirect.authInfoBytes.substring(0, 100) + '...',
      }
    }
  }, [signDirect])

  return (
    <Panel>
      <VStack gap={12} scrollable={true}>
        <StyledTitle color={'text'} fontSize={14}>
          {t('signDirect')}
        </StyledTitle>
        <Text color="info" family="mono" size={14} weight={500}>
          <pre style={{ width: '100%' }}>
            <code
              style={{
                display: 'block',
                overflowX: 'auto',
                width: '100%',
              }}
            >
              {JSON.stringify(displayData, null, 2)}
            </code>
          </pre>
        </Text>
      </VStack>
    </Panel>
  )
}
