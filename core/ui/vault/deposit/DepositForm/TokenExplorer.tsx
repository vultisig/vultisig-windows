import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  activeOption?: AccountCoin
  onOptionClick: (option: AccountCoin) => void
  onClose: () => void
  options: AccountCoin[]
}

export const TokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
  options,
}) => {
  const { t } = useTranslation()

  return (
    <Modal onClose={onClose} title={t('select_token')}>
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
