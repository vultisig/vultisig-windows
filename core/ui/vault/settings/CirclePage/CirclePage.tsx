import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ShareVaultCard } from '@core/ui/vault/share/ShareVaultCard'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { NavigationXIcon } from '@lib/ui/icons/NavigationXIcon'
import { Image } from '@lib/ui/image/Image'
import { hStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { APYOverview } from './components/APYOverview'
import { BalanceOverviewTable } from './components/BalanceOverviewTable'
import { TransactionActions } from './components/TransactionActions'

export const CirclePage = () => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  return (
    <VStack fullHeight>
      <StyledHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('circle_title')}
      />
      <StyledPageContent>
        <Image
          src="/core/images/circle-screen-bg.png"
          alt="register vault"
          width={353}
          height={143}
        />
        <Text size={14} color="shyExtra">
          Deposit your $USDC into a Circle account and earn yield. Securely
          within your Vultisig vault.
        </Text>
        <MainWrapper>
          <Text weight={600}>Balance Overview</Text>
          <BalanceOverviewTable />
          <APYOverview />
          <div />
          <Button>CLaim Rewards</Button>
          <TransactionActions />
          <BannerWrapper>
            <Text size={12} color="shyExtra">
              Funds remain fully under your vault’s control. Circle yield is
              generated through secure off-chain treasuries. Withdraw anytime
              after settlement.
            </Text>
            <IconButton>
              <IconWrapper size={8}>
                <NavigationXIcon />
              </IconWrapper>
            </IconButton>
          </BannerWrapper>
        </MainWrapper>
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

const StyledHeader = styled(PageHeader)`
  position: relative;
  z-index: 1;
`

const StyledPageContent = styled(PageContent)`
  max-width: 353px;
  margin-inline: auto;

  ${vStack({
    gap: 12,
    flexGrow: true,
  })};
`

const MainWrapper = styled.div`
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${getColor('foregroundSuper')};
  background: ${getColor('foreground')};

  ${vStack({
    gap: 15,
  })};
`

const BannerWrapper = styled.div`
  ${hStack({
    justifyContent: 'space-between',
  })};

  padding: 13px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
`
