import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { InfoBlock } from '@lib/ui/status/InfoBlock'
import { Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

export const ReshareVaultPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const securityType = useCurrentVaultSecurityType()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('reshare')}</PageHeaderTitle>}
      />
      <PageContent>
        <VStack gap={8} flexGrow alignItems="center" justifyContent="center">
          <Text size={20} color="contrast" weight="600">
            {t('reshare_your_vault')}
          </Text>
          <Text size={14} color="supporting">
            {t('reshare_explanation')}
          </Text>
        </VStack>
        <VStack gap={20}>
          <InfoBlock>{t('reshare_disclaimer')}</InfoBlock>
          <Button
            onClick={() =>
              match(securityType, {
                fast: () => navigate('reshareVaultFast'),
                secure: () => navigate('reshareVaultSecure'),
              })
            }
            kind="primary"
          >
            {t('start_reshare')}
          </Button>
          <Button
            onClick={() =>
              navigate('uploadQr', { params: { title: t('join_reshare') } })
            }
            kind="outlined"
          >
            {t('join_reshare')}
          </Button>
        </VStack>
      </PageContent>
    </>
  )
}
