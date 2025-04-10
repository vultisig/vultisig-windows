import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp, OptionsProp, TitleProp } from '@lib/ui/props'
import { FC, ReactNode, useState } from 'react'
import styled from 'styled-components'

import { Modal } from '../../../lib/ui/modal'
import { SearchField } from '../../../lib/ui/search/SearchField'

type SelectItemModalProps<T> = OnFinishProp<T, 'optional'> &
  OptionsProp<T> &
  TitleProp & {
    optionComponent: FC<{ value: T; onClick: () => void }>
    filterFunction: (option: T, query: string) => boolean
    renderListHeader?: () => ReactNode
  }

export const SelectItemModal = <T extends { id: string; chain?: string }>({
  onFinish,
  options,
  title,
  optionComponent: OptionComponent,
  filterFunction,
  renderListHeader,
}: SelectItemModalProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <Modal
      width={480}
      placement="center"
      title={title}
      onClose={() => onFinish()}
    >
      <VStack gap={20}>
        {options.length > 1 && <SearchField onSearch={setSearchQuery} />}
        <VStack gap={16}>
          {renderListHeader && renderListHeader()}
          <ListWrapper>
            {options
              .filter(option => filterFunction(option, searchQuery))
              .map(option => (
                <OptionComponent
                  key={`${option.id}-${option.chain}`}
                  value={option}
                  onClick={() => onFinish(option)}
                />
              ))}
          </ListWrapper>
        </VStack>
      </VStack>
    </Modal>
  )
}

const ListWrapper = styled(VStack)`
  & > :first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  & > :last-child {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`
