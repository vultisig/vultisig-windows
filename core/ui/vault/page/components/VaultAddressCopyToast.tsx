import { Chain } from '@core/chain/Chain'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { vStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { ValueProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const VaultAddressCopyToast = ({ value: chain }: ValueProp<Chain>) => {
  return (
    <Wrapper>
      <IconWrapper size={24} color="primary">
        <CircleCheckIcon />
      </IconWrapper>
      <Text size={13}>{chain} address copied</Text>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 16px 16px 16px 12px;
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - ${pageConfig.horizontalPadding * 2}px);

  ${vStack({
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  })};

  border-radius: 24px;
  border: 1px solid ${getColor('foregroundSuper')};
  background: ${getColor('foregroundExtra')};

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: 340px;
  }
`
