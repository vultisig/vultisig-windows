import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ShareVaultCard } from '@core/ui/vault/share/ShareVaultCard'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { Image } from '@lib/ui/image/Image'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { RegisterGuideBulletPoints } from './RegisterGuideBulletPoints'

export const AirdropRegisterPage = () => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  return (
    <VStack fullHeight>
      <StyledHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('vault_register_for_airdrop_title')}
      />
      <StyledPageContent alignItems="center" flexGrow>
        <ImageWrapper>
          <Image
            src="/core/images/register-vault-bg.png"
            alt="register vault"
            width={400}
            height={330}
          />
        </ImageWrapper>

        <RegisterGuideBulletPoints />
      </StyledPageContent>
      <PageFooter>
        <SaveAsImage
          fileName={vault.name}
          renderTrigger={({ onClick }) => (
            <Button onClick={onClick}>
              {t('vault_register_for_airdrop_save_vault_QR_button')}
            </Button>
          )}
          value={<ShareVaultCard />}
        />
      </PageFooter>
    </VStack>
  )
}

const ImageWrapper = styled.div`
  position: relative;
`

const StyledHeader = styled(PageHeader)`
  position: relative;
  z-index: 1;
`

const StyledPageContent = styled(PageContent)`
  position: relative;
  top: -75px;
`
