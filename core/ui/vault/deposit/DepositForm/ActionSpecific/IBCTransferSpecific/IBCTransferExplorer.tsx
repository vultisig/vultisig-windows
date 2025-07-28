import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type IBCDesitinationChainOption = {
  label: string
  value: string
}

type IBCTransferExplorerProps = {
  options: IBCDesitinationChainOption[]
  onClose: () => void
  onOptionClick: (option: string) => void
  activeOption?: string
}

export const IBCTransferExplorer: FC<IBCTransferExplorerProps> = ({
  onClose,
  options,
  onOptionClick,
  activeOption,
}) => {
  const { t } = useTranslation()

  return (
    <Modal onClose={onClose} title={t('chain')}>
      <VStack gap={20}>
        {options.map(option => (
          <DepositActionOption
            key={option.label}
            value={option.label}
            isActive={activeOption === option.value}
            onClick={() => {
              onOptionClick(option.value)
              onClose()
            }}
          />
        ))}
      </VStack>
    </Modal>
  )
}
