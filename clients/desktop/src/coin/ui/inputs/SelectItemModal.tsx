import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { VStack } from '../../../lib/ui/layout/Stack'
import { Modal } from '../../../lib/ui/modal'
import { OnFinishProp, OptionsProp } from '../../../lib/ui/props'
import { SearchField } from '../../../lib/ui/search/SearchField'

type SelectOverlayProps<T> = OnFinishProp<T, 'optional'> &
  OptionsProp<T> & {
    titleKey: string
    optionComponent: FC<{
      value: T
      onClick: () => void
    }>
  }

export const SelectItemModal = <T extends { id: string; chain?: string }>({
  onFinish,
  options,
  titleKey,
  optionComponent: OptionComponent,
}: SelectOverlayProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useTranslation()

  return (
    <Modal
      width={480}
      placement="center"
      title={t(titleKey)}
      onClose={() => onFinish()}
    >
      <VStack gap={20}>
        {options.length > 1 && <SearchField onSearch={setSearchQuery} />}
        <ListWrapper>
          {withoutDuplicates(
            options.filter(option =>
              option.chain?.toLowerCase().includes(searchQuery.toLowerCase())
            ),
            (a, b) => a.id === b.id
          ).map(option => (
            <OptionComponent
              key={option.id}
              value={option}
              onClick={() => onFinish(option)}
            />
          ))}
        </ListWrapper>
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
