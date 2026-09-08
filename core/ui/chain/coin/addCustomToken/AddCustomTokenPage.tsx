import { AddCustomTokenForm } from '@core/ui/chain/coin/addCustomToken/AddCustomTokenForm'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCore } from '@core/ui/state/core'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'

/** Pops add-custom-token then token picker (`manageVaultChainCoins`); result is inline on this page. */
const tokenPickerDepthAfterCustomAdd = 2

export const AddCustomTokenPage = () => {
  const { t } = useTranslation()
  const [{ chain, closeParentAfterAdd }] = useCoreViewState<'addCustomToken'>()
  const { popNavigationHistory } = useCore()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('find_custom_token')}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <AddCustomTokenForm
          chain={chain}
          onTokenAdded={
            closeParentAfterAdd
              ? () => popNavigationHistory(tokenPickerDepthAfterCustomAdd)
              : undefined
          }
        />
      </PageContent>
    </>
  )
}
