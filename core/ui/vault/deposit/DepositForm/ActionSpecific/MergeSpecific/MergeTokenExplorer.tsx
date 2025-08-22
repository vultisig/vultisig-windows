import {
  kujiraCoinMigratedToThorChainDestinationId,
  kujiraCoinThorChainMergeContracts,
} from '@core/chain/chains/cosmos/thor/kujira-merge'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useMergeOptions } from '../../../hooks/useMergeOptions'
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
  const [, setDepositCoin] = useDepositCoin()
  const tokens = useMergeOptions()
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
