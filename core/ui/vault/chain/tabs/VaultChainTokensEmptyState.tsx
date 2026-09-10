import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CircleDashedIcon } from '@lib/ui/icons/CircleDashedIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

/**
 * Card shown on the chain page's Tokens tab when the list has nothing to
 * render — a search that matches no enabled token, or a chain left with no
 * coins. Points the user at the manage-tokens screen for the current chain.
 */
export const VaultChainTokensEmptyState = () => {
  const { t } = useTranslation()
  const chain = useCurrentVaultChain()
  const navigate = useCoreNavigate()

  return (
    <Wrapper data-testid="vault-chain-tokens-empty-state">
      <IconWrapper size={24} color="primaryAccentFour">
        <CircleDashedIcon />
      </IconWrapper>
      <Copy gap={8}>
        <Text centerHorizontally size={15} weight={500}>
          {t('no_tokens_selected')}
        </Text>
        <Text centerHorizontally variant="footnote" color="shy">
          {t('no_tokens_selected_description')}
        </Text>
      </Copy>
      <Button
        size="xs"
        icon={<PencilIcon />}
        onClick={() =>
          navigate({ id: 'manageVaultChainCoins', state: { chain } })
        }
      >
        {t('manage_tokens')}
      </Button>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  ${vStack({
    gap: 12,
    alignItems: 'center',
  })};
  padding: 32px 16px;
  ${borderRadius.xl};
  background: ${getColor('foreground')};
`

// The design caps the copy so it wraps to two or three short lines rather
// than stretching across the whole card.
const Copy = styled(VStack)`
  max-width: 263px;
`
