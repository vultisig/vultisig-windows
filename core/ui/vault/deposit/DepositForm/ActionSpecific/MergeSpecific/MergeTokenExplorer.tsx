import { Chain } from '@core/chain/Chain'
import {
  kujiraCoinMigratedToThorChainDestinationId,
  kujiraCoinThorChainMergeContracts,
} from '@core/chain/chains/cosmos/thor/kujira-merge'
import { kujiraCoinsOnThorChain } from '@core/chain/chains/cosmos/thor/kujira-merge/kujiraCoinsOnThorChain'
import { Coin } from '@core/chain/coin/Coin'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'
import { FC, useMemo } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FormData } from '../..'
import { DepositActionOption } from '../../DepositActionOption'

type Props = {
  activeOption?: Coin
  onOptionClick: (option: Coin) => void
  onClose: () => void
  setValue: UseFormSetValue<FormData>
}

export const MergeTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
  setValue,
}) => {
  const thorChainCoins = useCurrentVaultChainCoins(Chain.THORChain)

  const tokens = useMemo(
    () => thorChainCoins.filter(coin => coin.id in kujiraCoinsOnThorChain),
    [thorChainCoins]
  )
  const { t } = useTranslation()

  return (
    <Modal
      width={480}
      placement="top"
      title={t('select_token')}
      onClose={onClose}
    >
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
                  const selectedMergeAddress =
                    kujiraCoinThorChainMergeContracts[
                      mirrorRecord(kujiraCoinMigratedToThorChainDestinationId)[
                        token.id
                      ]
                    ]

                  setValue('selectedCoin', token, {
                    shouldValidate: true,
                  })

                  setValue('nodeAddress', selectedMergeAddress, {
                    shouldValidate: true,
                  })

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
