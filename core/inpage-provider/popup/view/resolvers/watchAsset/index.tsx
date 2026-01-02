import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCreateCoinMutation } from '@core/ui/storage/coins'
import { Button } from '@lib/ui/buttons/Button'
import { Center } from '@lib/ui/layout/Center'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { useTranslation } from 'react-i18next'

export const WatchAsset: PopupResolver<'watchAsset'> = ({
  input,
  onFinish,
  context: { requestOrigin },
}) => {
  const { t } = useTranslation()
  const { mutate, isPending } = useCreateCoinMutation()

  const { chain, id, ticker, decimals, logo } = input

  const handleApprove = () => {
    mutate(
      {
        chain,
        id,
        ticker,
        decimals,
        logo,
      },
      {
        onSuccess: () => {
          onFinish({ result: { data: true }, shouldClosePopup: true })
        },
      }
    )
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
        secondaryControls={<PageHeaderBackButton />}
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('add_suggested_token')}
          </Text>
        }
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <Center flexGrow>
          <VStack gap={12} alignItems="center">
            <Text size={14}>
              {t('site_wants_to_add_token', {
                site: getUrlBaseDomain(requestOrigin),
              })}
            </Text>
            <CoinIcon style={{ fontSize: 64 }} coin={{ chain, id, logo }} />
            <VStack alignItems="center">
              <Text color="contrast" size={24} weight={600}>
                {ticker}
              </Text>
              <Text color="supporting" size={12}>
                {id}
              </Text>
            </VStack>
          </VStack>
        </Center>
      </PageContent>
      <PageFooter>
        <VStack gap={12}>
          <Button onClick={handleApprove} loading={isPending}>
            {t('approve')}
          </Button>
          <Button onClick={handleReject} kind="secondary">
            {t('reject')}
          </Button>
        </VStack>
      </PageFooter>
    </VStack>
  )
}
