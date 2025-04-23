import { TxOverviewRow } from '@core/ui/chain/tx/TxOverviewRow'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const SwapTxFeesOverviewRow = styled(TxOverviewRow)`
  ${hStack({
    fullWidth: true,
    alignItems: 'center',
    justifyContent: 'space-between',
    wrap: 'wrap',
    gap: 20,
  })}

  ${text({
    weight: 500,
    size: 13,
    color: 'supporting',
  })}

  border-bottom: 1px solid ${getColor('foregroundExtra')};
  padding-bottom: 12px;
`
export const ContentWrapper = styled(VStack)`
  padding: 24px;
  background: ${getColor('foreground')};
  border-radius: 16px;
`

export const IconWrapper = styled.div`
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  font-size: 14px;
  background-color: ${getColor('foregroundExtra')};
  border-radius: 99px;
  position: relative;

  &:before {
    position: absolute;
    content: '';
    width: 1px;
    background-color: ${getColor('foregroundExtra')};
    height: 12px;
    top: -14px;
    left: 12px;
  }

  &:after {
    position: absolute;
    content: '';
    width: 1px;
    background-color: ${getColor('foregroundExtra')};
    height: 13px;
    bottom: -16px;
    left: 12px;
  }
`

export const HorizontalLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: ${getColor('foregroundExtra')};
`
