import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { CustomTokenResult } from '@core/ui/chain/coin/addCustomToken//CustomTokenResult'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { CryptoIcon } from '@lib/ui/icons/CryptoIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const AddCustomTokenPage = () => {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const [{ chain }] = useCoreViewState<'addCustomToken'>()
  const walletCore = useAssertWalletCore()

  const isValid = value
    ? isValidAddress({
        chain,
        address: value,
        walletCore,
      })
    : false

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('find_custom_token')}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <SearchInput value={value} onChange={setValue} />
        {value ? (
          isValid ? (
            <CustomTokenResult id={value} />
          ) : (
            <EmptyState
              icon={
                <IconWrapper size={48} color="primary">
                  <CryptoIcon />
                </IconWrapper>
              }
              title={t('no_token_found')}
              description={t('token_not_found_invalid')}
            />
          )
        ) : null}
      </PageContent>
    </>
  )
}
