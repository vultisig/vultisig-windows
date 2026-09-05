import { CustomTokenResult } from '@core/ui/chain/coin/addCustomToken/CustomTokenResult'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { CryptoIcon } from '@lib/ui/icons/CryptoIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { Chain } from '@vultisig/core-chain/Chain'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import {
  isValidTokenId,
  normalizeTokenId,
} from '@vultisig/core-chain/utils/isValidTokenId'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type AddCustomTokenFormProps = {
  chain: Chain
  onTokenAdded?: (coin: Coin) => void
}

/**
 * Contract-address lookup plus the add/remove result for one chain. Rendered
 * both as a page of its own and inside the swap asset picker, so it owns no
 * navigation of its own — the host decides what a successful add leads to.
 */
export const AddCustomTokenForm = ({
  chain,
  onTokenAdded,
}: AddCustomTokenFormProps) => {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const walletCore = useAssertWalletCore()

  // XRPL tokens can be pasted by their human ticker (`SOLO.rsoLo…`, as shown on
  // explorers) or on-ledger currency code; canonicalise so validation, lookup,
  // and storage all use the same id auto-discovery produces for a held token.
  const id = value ? normalizeTokenId({ chain, id: value }) : ''

  const isValid = id
    ? isValidTokenId({
        chain,
        id,
        walletCore,
      })
    : false

  return (
    <VStack gap={24}>
      <SearchInput value={value} onChange={setValue} />
      {value ? (
        isValid ? (
          <CustomTokenResult
            chain={chain}
            id={id}
            onTokenAdded={onTokenAdded}
          />
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
    </VStack>
  )
}
