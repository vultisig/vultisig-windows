import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { OnFinishProp, OptionsProp, TitleProp } from '@lib/ui/props'
import { SearchField } from '@lib/ui/search/SearchField'
import React, {
  FC,
  ReactNode,
  useDeferredValue,
  useMemo,
  useState,
} from 'react'
import { Virtuoso } from 'react-virtuoso'
import styled from 'styled-components'

type SelectItemModalProps<T> = OnFinishProp<T, 'optional'> &
  OptionsProp<T> &
  TitleProp & {
    optionComponent: FC<{ value: T; onClick: () => void }>
    filterFunction: (option: T, query: string) => boolean
    renderListHeader?: () => ReactNode
    renderFooter?: () => ReactNode
    virtualizePageSize?: number
    getKey?: (option: T, index: number) => string
  }

const modalOptionsListHeight = 400
const offset = 100
const defaultIncreaseViewportForVirtualizedList =
  modalOptionsListHeight + offset

export const SelectItemModal = <T extends { id?: string; chain?: string }>(
  props: SelectItemModalProps<T>
) => {
  const {
    onFinish,
    options,
    title,
    optionComponent: OptionComponent,
    filterFunction,
    renderFooter,
    renderListHeader,
    virtualizePageSize,
    getKey,
  } = props

  const [searchQuery, setSearchQuery] = useState('')
  const deferredQuery = useDeferredValue(searchQuery)

  const filtered = useMemo(
    () => options.filter(o => filterFunction(o, deferredQuery)),
    [options, filterFunction, deferredQuery]
  )

  const useVirtual = Boolean(virtualizePageSize) && filtered.length > 30

  return (
    <Modal onClose={() => onFinish()} title={title}>
      <VStack gap={8}>
        {options.length > 1 && <SearchField onSearch={setSearchQuery} />}
        {renderListHeader?.() || <div />}

        <ListWrapper>
          {useVirtual ? (
            <Virtuoso
              style={{ height: modalOptionsListHeight }}
              totalCount={filtered.length}
              data={filtered}
              increaseViewportBy={
                virtualizePageSize ?? defaultIncreaseViewportForVirtualizedList
              }
              itemContent={(index, item) => (
                <OptionComponent value={item} onClick={() => onFinish(item)} />
              )}
              components={{
                List: StyledList,
              }}
            />
          ) : (
            <NonVirtualList>
              {filtered.map((option, index) => (
                <OptionComponent
                  key={getKey?.(option, index) || option?.id || index}
                  value={option}
                  onClick={() => onFinish(option)}
                />
              ))}
            </NonVirtualList>
          )}
        </ListWrapper>

        {renderFooter?.()}
      </VStack>
    </Modal>
  )
}

const ListWrapper = styled.div`
  max-height: ${modalOptionsListHeight}px;
  overflow-y: auto;
`

const NonVirtualList = styled.div`
  display: flex;
  flex-direction: column;
  & > * + * {
    margin-top: 8px;
  }

  & > :first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
  & > :last-child {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`

const StyledList = styled.div`
  & > * + * {
    margin-top: 8px;
  }

  & > :first-child > * {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
  & > :last-child > * {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`
