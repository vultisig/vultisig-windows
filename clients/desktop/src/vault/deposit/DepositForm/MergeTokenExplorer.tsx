import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { getMergeAcceptedTokens } from '@core/chain/coin/ibc'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC, useEffect, useMemo } from 'react'
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Modal } from '../../../lib/ui/modal'
import { FormData } from '.'
import { DepositActionOption } from './DepositActionOption'

const useUserMergeAcceptedTokens = () => {
  const userCoins = useCurrentVaultCoins()

  return useMemo(() => {
    const userCoinIds = new Set(userCoins.map(c => c.id))

    return getMergeAcceptedTokens().filter(
      token => token.chain === Chain.THORChain && userCoinIds.has(token.id)
    )
  }, [userCoins])
}

type Props = {
  activeOption?: Coin
  onOptionClick: (option: Coin) => void
  onClose: () => void
  getValues: UseFormGetValues<FormData>
  setValue: UseFormSetValue<FormData>
}

export const MergeTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
  getValues,
  setValue,
}) => {
  const tokens = useUserMergeAcceptedTokens()
  const selectedCoin = getValues('selectedCoin')
  const { t } = useTranslation()

  useEffect(() => {
    const selectedMergeAddress = tokens.find(
      t => t.ticker === selectedCoin?.ticker
    )?.thorchainAddress

    setValue('nodeAddress', selectedMergeAddress, {
      shouldValidate: true,
    })
  }, [selectedCoin?.ticker, setValue, tokens])

  return (
    <Modal width={480} placement="top" title="Select Token" onClose={onClose}>
      <VStack gap={20}>
        {tokens.length > 0 ? (
          tokens.map((token, index) => {
            return (
              <DepositActionOption
                key={index}
                value={token.ticker}
                isActive={activeOption?.ticker === token.ticker}
                onClick={() => {
                  onOptionClick(token)
                  onClose()
                }}
              />
            )
          })
        ) : (
          <Text size={16} color="contrast">
            {t('no_tokens_found')}
          </Text>
        )}
      </VStack>
    </Modal>
  )
}
