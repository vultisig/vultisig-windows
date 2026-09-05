import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CircleDashedIcon } from '@lib/ui/icons/CircleDashedIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { OnClickProp } from '@lib/ui/props'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type SwapCoinsEmptyStateProps = Partial<OnClickProp>

/**
 * Shown when the swap asset search matches nothing. The add-custom-token CTA
 * renders only when `onClick` is given, which the picker withholds on chains
 * where the custom-token flow has no metadata source to resolve against.
 */
export const SwapCoinsEmptyState = ({ onClick }: SwapCoinsEmptyStateProps) => {
  const { t } = useTranslation()

  return (
    <VStack gap={4} data-testid="swap-explorer-empty-state">
      <EmptyState
        icon={
          <IconWrapper size={24} color="primaryAccentFour">
            <CircleDashedIcon />
          </IconWrapper>
        }
        title={t('swap_no_token_found')}
      />
      {onClick ? (
        <AddCustomTokenButton
          onClick={onClick}
          data-testid="swap-explorer-add-custom-token"
        >
          <Text centerHorizontally color="info" size={12} weight={500}>
            {t('swap_add_custom_token')}
          </Text>
        </AddCustomTokenButton>
      ) : null}
    </VStack>
  )
}

// 4px from the stack plus 12px here keeps Figma's 16px gap while giving the
// 12px label a tappable height.
const AddCustomTokenButton = styled(UnstyledButton)`
  padding: 12px;
  width: 100%;
`
