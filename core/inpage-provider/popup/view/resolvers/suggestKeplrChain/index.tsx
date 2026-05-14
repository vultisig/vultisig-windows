import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getUrlBaseDomain } from '@vultisig/lib-utils/url/baseDomain'
import { useTranslation } from 'react-i18next'

export const SuggestKeplrChain: PopupResolver<'suggestKeplrChain'> = ({
  input,
  onFinish,
  context: { requestOrigin },
}) => {
  const { t } = useTranslation()
  const { chainInfo } = input

  const handleApprove = () => {
    onFinish({ result: { data: true }, shouldClosePopup: true })
  }

  const handleReject = () => {
    onFinish({
      result: { error: new Error('User rejected the request') },
      shouldClosePopup: true,
    })
  }

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={handleReject} />}
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('suggest_chain_title')}
          </Text>
        }
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <VStack gap={8} alignItems="center">
          <Text color="contrast" size={22} weight={500}>
            {chainInfo.chainName}
          </Text>
          <Text color="supporting" size={14}>
            {t('suggest_chain_subtitle', {
              site: getUrlBaseDomain(requestOrigin),
            })}
          </Text>
        </VStack>
        <List>
          <ListItem title={t('chain_id')} extra={chainInfo.chainId} />
          <ListItem
            title={t('bech32_prefix')}
            extra={chainInfo.bech32Config?.bech32PrefixAccAddr ?? '-'}
          />
          <ListItem
            title={t('fee_currency')}
            extra={chainInfo.feeCurrencies[0]?.coinDenom ?? '-'}
          />
          <ListItem title={t('rpc_endpoint')} extra={chainInfo.rpc} />
          <ListItem title={t('rest_endpoint')} extra={chainInfo.rest} />
        </List>
      </PageContent>
      <PageFooter>
        <HStack gap={12} fullWidth>
          <Button onClick={handleReject} kind="secondary">
            {t('reject')}
          </Button>
          <Button onClick={handleApprove}>{t('approve')}</Button>
        </HStack>
      </PageFooter>
    </VStack>
  )
}
