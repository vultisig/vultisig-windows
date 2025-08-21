import { Chain } from '@core/chain/Chain'
import {
  kujiraCoinMigratedToThorChainDestinationId,
  kujiraCoinThorChainMergeContracts,
} from '@core/chain/chains/cosmos/thor/kujira-merge'
import { kujiraCoinsOnThorChain } from '@core/chain/chains/cosmos/thor/kujira-merge/kujiraCoinsOnThorChain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDepositCoin } from '../../../providers/DepositCoinProvider'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'

type Props = {
  activeOption?: AccountCoin
  onOptionClick: (option: AccountCoin) => void
  onClose: () => void
}

export const MergeTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
}) => {
  const [{ setValue }] = useDepositFormHandlers()
  const thorChainCoins = useCurrentVaultChainCoins(Chain.THORChain)
  const [, setDepositCoin] = useDepositCoin()
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

                  setDepositCoin(token)
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
