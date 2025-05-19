import { Coin } from '@core/chain/coin/Coin'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { DepositActionOption } from './DepositActionOption'

type Props = {
  activeOption?: Coin
  onOptionClick: (option: Coin) => void
  onClose: () => void
  options: Coin[]
}

export const TokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
  options,
}) => {
  const { t } = useTranslation()

  return (
    <Modal
      width={480}
      placement="top"
      title={t('select_token')}
      onClose={onClose}
    >
      <VStack gap={20}>
        {options.length > 0 ? (
          options.map((token, index) => {
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
