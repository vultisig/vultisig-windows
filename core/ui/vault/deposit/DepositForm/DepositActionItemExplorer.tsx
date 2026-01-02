import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type DepositActionItemExplorerProps = {
  options: ChainAction[]
  onClose: () => void
  onOptionClick: (option: ChainAction) => void
  activeOption?: ChainAction
}

export const DepositActionItemExplorer: FC<DepositActionItemExplorerProps> = ({
  onClose,
  options,
  onOptionClick,
  activeOption,
}) => {
  const { t } = useTranslation()

  return (
    <Modal onClose={onClose} title="">
      <ScrollableContent gap={20}>
        {options.map((option, index) => {
          return (
            <DepositActionOption
              key={index}
              value={t(option)}
              isActive={activeOption === option}
              onClick={() => onOptionClick(option)}
            />
          )
        })}
      </ScrollableContent>
    </Modal>
  )
}

const ScrollableContent = styled(VStack)`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  ${hideScrollbars};
`
