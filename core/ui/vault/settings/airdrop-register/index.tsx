import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { useCore } from '@core/ui/state/core'
import { ShareVaultCard } from '@core/ui/vault/share/ShareVaultCard'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { VultisigLogoIcon } from '@lib/ui/icons/VultisigLogoIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledButton = styled(UnstyledButton)`
  background-color: ${getColor('foreground')};
  border-radius: 8px;
  color: ${getColor('primary')};
  display: inline-block;
  font-weight: 600;
  margin-left: 8px;
  padding: 8px 16px;
`

const StyledScaleIn = styled.div`
  animation: scale-in 0.5s ease-in-out;

  @keyframes scale-in {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
`

export const AirdropRegisterPage = () => {
  const { t } = useTranslation()
  const { openUrl } = useCore()
  const vault = useCurrentVault()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {t('vault_register_for_airdrop_title')}
          </PageHeaderTitle>
        }
        hasBorder
      />
      <PageContent
        alignItems="center"
        gap={24}
        justifyContent="space-between"
        flexGrow
      >
        <VStack flexGrow justifyContent="center">
          <StyledScaleIn>
            <VultisigLogoIcon fontSize={280} />
          </StyledScaleIn>
        </VStack>
        <VStack gap={24}>
          <Text color="contrast" size={18} weight={500}>
            {t('vault_register_for_airdrop_list_item_1')}
          </Text>
          <Text color="contrast" size={18} weight={500}>
            {t('vault_register_for_airdrop_list_item_2_part_1')}{' '}
            <StyledButton
              onClick={() => openUrl('https://airdrop.vultisig.com')}
            >
              {t('vault_register_for_airdrop_list_item_2_part_2')}
            </StyledButton>
          </Text>
          <Text color="contrast" size={18} weight={500}>
            {t('vault_register_for_airdrop_list_item_3')}
          </Text>
          <Text color="contrast" size={18} weight={500}>
            {t('vault_register_for_airdrop_list_item_4')}
          </Text>
        </VStack>
      </PageContent>
      <PageFooter>
        <SaveAsImage
          fileName={vault.name}
          renderTrigger={({ onClick }) => (
            <Button kind="primary" onClick={onClick}>
              {t('vault_register_for_airdrop_save_vault_QR_button')}
            </Button>
          )}
          value={<ShareVaultCard />}
        />
      </PageFooter>
    </VStack>
  )
}
