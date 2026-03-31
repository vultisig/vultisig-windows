import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Panel } from '@lib/ui/panel/Panel'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { SignTon } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { formatUnits } from 'ethers'
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

const tonDecimals = chainFeeCoin[Chain.Ton].decimals
const tonTicker = chainFeeCoin[Chain.Ton].ticker

export const SignTonDisplay = ({ signTon }: { signTon: SignTon }) => {
  const { t } = useTranslation()
  const { tonMessages } = signTon

  return (
    <Panel>
      <VStack gap={12}>
        <StyledTitle color="text" fontSize={14}>
          {t('transfer')}
        </StyledTitle>
        <VStack gap={16}>
          {tonMessages.map((msg, index) => (
            <List key={index}>
              <ListItem description={msg.to} title={t('to')} />
              <ListItem
                description={`${formatUnits(msg.amount, tonDecimals)} ${tonTicker}`}
                title={t('amount')}
              />
            </List>
          ))}
        </VStack>
      </VStack>
    </Panel>
  )
}
