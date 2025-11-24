import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { CustomToken } from '@core/ui/chain/coin/addCustomToken/CustomToken'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const AddCustomTokenPage = () => {
  const { t } = useTranslation()

  const walletCore = useAssertWalletCore()
  const [{ chain }] = useCoreViewState<'addCustomToken'>()

  const [value, setValue] = useState('')

  const isValid = value
    ? isValidAddress({
        chain,
        address: value,
        walletCore,
      })
    : false

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('find_custom_token')}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <SearchInput value={value} onChange={setValue} />
        {value && isValid && <CustomToken id={value} />}
      </PageContent>
    </VStack>
  )
}
