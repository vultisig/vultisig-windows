import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { ProductLogo } from '@core/ui/product/ProductLogo'
import { useOpenUrl } from '@core/ui/state/openUrl'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { useTranslation } from 'react-i18next'

import { ShareVaultCard } from '../../vault/share/ShareVaultCard'
import { VULTISIG_WEBSITE_LINK } from '../vaultSettings/constants'
import {
  ListItem,
  ListWrapper,
  LogoAndListWrapper,
  OneOffButton,
  ProductLogoWrapper,
  StretchedButton,
  Wrapper,
} from './RegisterForAirdropPage.styles'

const RegisterForAirdropPage = () => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  const openUrl = useOpenUrl()

  return (
    <PageSlice flexGrow>
      <PageHeader
        data-testid="EditVaultPage-PageHeader"
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {t('vault_register_for_airdrop_title')}
          </PageHeaderTitle>
        }
      />
      <PageContent>
        <Wrapper>
          <LogoAndListWrapper>
            <ProductLogoWrapper>
              <ProductLogo style={{ fontSize: 280 }} />
            </ProductLogoWrapper>
            <ListWrapper>
              <ListItem>{t('vault_register_for_airdrop_list_item_1')}</ListItem>
              <ListItem>
                {t('vault_register_for_airdrop_list_item_2_part_1')}{' '}
                <OneOffButton onClick={() => openUrl(VULTISIG_WEBSITE_LINK)}>
                  {t('vault_register_for_airdrop_list_item_2_part_2')}
                </OneOffButton>
              </ListItem>
              <ListItem>{t('vault_register_for_airdrop_list_item_3')}</ListItem>
              <ListItem>{t('vault_register_for_airdrop_list_item_4')}</ListItem>
            </ListWrapper>
          </LogoAndListWrapper>
          <SaveAsImage
            fileName={vault.name}
            renderTrigger={({ onClick }) => (
              <StretchedButton onClick={onClick} kind="primary">
                {t('vault_register_for_airdrop_save_vault_QR_button')}
              </StretchedButton>
            )}
            value={<ShareVaultCard />}
          />
        </Wrapper>
      </PageContent>
    </PageSlice>
  )
}

export default RegisterForAirdropPage
