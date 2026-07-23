import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type LimitExecuteWhenCollapsedProps = {
  onExpand: () => void
}

/**
 * Header-only form of the price step, shown while the asset step is open.
 *
 * The design keeps both cards on screen rather than gating the second behind a
 * confirm button, so this doubles as the control that advances the flow.
 */
export const LimitExecuteWhenCollapsed: FC<LimitExecuteWhenCollapsedProps> = ({
  onExpand,
}) => {
  const { t } = useTranslation()

  return (
    <Card type="button" onClick={onExpand} data-testid="limit-execute-expand">
      <Text size={14} weight={500} color="contrast">
        {t('swap_limit_execute_when')}
      </Text>
    </Card>
  )
}

const Card = styled(UnstyledButton)`
  width: 100%;
  text-align: left;
  border: 1px solid ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
`
