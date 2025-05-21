import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { DepositActionOption } from '../../DepositActionOption'

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
    <Modal width={480} placement="top" title={t('chain')} onClose={onClose}>
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
