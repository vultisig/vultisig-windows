import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const BannerPromoCtaButton = styled(UnstyledButton)`
  ${text({
    size: 12,
    weight: 500,
    height: 16 / 12,
  })};

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 30px;
  background: ${getColor('primary')};
  color: ${getColor('background')};
  white-space: nowrap;
  box-shadow:
    inset 0 -1px 0.5px 0 rgba(15, 28, 62, 1),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.1);
  transition:
    transform 0.2s,
    opacity 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.02);
    opacity: 0.9;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }
`
