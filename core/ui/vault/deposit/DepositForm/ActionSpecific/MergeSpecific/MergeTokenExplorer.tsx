import { Chain } from '@core/chain/Chain'
import {
  kujiraCoinMigratedToThorChainDestinationId,
  kujiraCoinThorChainMergeContracts,
} from '@core/chain/chains/cosmos/thor/kujira-merge'
import { kujiraCoinsOnThorChain } from '@core/chain/chains/cosmos/thor/kujira-merge/kujiraCoinsOnThorChain'
import { Coin } from '@core/chain/coin/Coin'
import { FormData } from '@core/ui/vault/deposit/DepositForm'
import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'
import { FC, useMemo } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

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
    () =>
      thorChainCoins.filter(
        coin => coin.id && coin.id in kujiraCoinsOnThorChain
      ),
    [thorChainCoins]
  )
  const { t } = useTranslation()

  return (
    <Modal onClose={onClose} title={t('select_token')}>
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
                        shouldBePresent(token.id)
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
