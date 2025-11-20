import { SignAmino } from '@core/mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
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

export const SignAminoDisplay = ({ signAmino }: { signAmino: SignAmino }) => {
  const { t } = useTranslation()
  const { msgs } = signAmino

  const formattedMessages = msgs.map(msg => {
    return {
      type: msg.type,
      value: JSON.parse(msg.value),
    }
  })

  return (
    <Panel>
      <VStack gap={12} scrollable={true}>
        <StyledTitle color={'text'} fontSize={14}>
          {t('signAmino')}
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
              {formattedMessages
                .map(msg => JSON.stringify(msg, null, 2))
                .join('\n')}
            </code>
          </pre>
        </Text>
      </VStack>
    </Panel>
  )
}
