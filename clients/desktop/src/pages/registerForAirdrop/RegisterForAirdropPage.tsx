import { useTranslation } from 'react-i18next'

import { BrowserOpenURL } from '../../../wailsjs/runtime/runtime'
import { SaveAsImage } from '../../ui/file/SaveAsImage'
import { ProductLogo } from '../../ui/logo/ProductLogo'
import { PageContent } from '../../ui/page/PageContent'
import { PageHeader } from '../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle'
import { PageSlice } from '../../ui/page/PageSlice'
import { ShareVaultCard } from '../../vault/share/ShareVaultCard'
import { useCurrentVault } from '../../vault/state/currentVault'
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
                <OneOffButton
                  onClick={() => BrowserOpenURL(VULTISIG_WEBSITE_LINK)}
                >
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
