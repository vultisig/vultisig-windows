import { borderRadiusPx } from '@lib/ui/css/borderRadius'
import { textInputBackground } from '@lib/ui/css/textInput'
import { VStack } from '@lib/ui/layout/Stack'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { TransferDirection } from '@vultisig/lib-utils/TransferDirection'
import styled, { css } from 'styled-components'

export const Container = styled(VStack)<{
  side: TransferDirection
}>`
  min-height: 112px;
  ${textInputBackground};
  ${text({
    color: 'contrast',
    size: 16,
    weight: 700,
  })}
  padding: clamp(12px, 3.33vw, 16px);

  /*
   * The reverse button floats over the seam between the two cards: it is 54px
   * tall and centred in the 8px gap, so it reaches 23px up into the From card.
   * Without room for it the suggestions run underneath it.
   */
  ${({ side }) =>
    side === 'from' &&
    css`
      padding-bottom: 24px;
    `}
  border-radius: ${({ side }) =>
    side === 'to'
      ? `${borderRadiusPx.md}px ${borderRadiusPx.md}px ${borderRadiusPx.xl}px ${borderRadiusPx.xl}px`
      : `${borderRadiusPx.xl}px ${borderRadiusPx.xl}px ${borderRadiusPx.md}px ${borderRadiusPx.md}px`};
  border: 1px solid ${getColor('foregroundExtra')};
`
