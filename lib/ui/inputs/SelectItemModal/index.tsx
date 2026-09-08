import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Modal } from '@lib/ui/modal'
import {
  IsLoadingProp,
  OnFinishProp,
  OptionsProp,
  TitleProp,
} from '@lib/ui/props'
import { SearchField } from '@lib/ui/search/SearchField'
import { FC, ReactNode, useMemo, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import styled from 'styled-components'

type SelectItemModalProps<T> = OnFinishProp<T, 'optional'> &
  OptionsProp<T> &
  TitleProp &
  IsLoadingProp & {
    optionComponent: FC<{ value: T; onClick: () => void }>
    filterFunction: (option: T, query: string) => boolean
    renderListHeader?: () => ReactNode
    renderFooter?: () => ReactNode
    /** Rendered in place of the list when the query matches nothing. */
    renderEmptyState?: () => ReactNode
    /** Controls the search query; pairs with `onSearchQueryChange`. */
    searchQuery?: string
    onSearchQueryChange?: (query: string) => void
    virtualizePageSize?: number
    getKey?: (option: T, index: number) => string
    loadingLabel?: string
  }

const modalOptionsListHeight = 400
const offset = 100
const defaultIncreaseViewportForVirtualizedList =
  modalOptionsListHeight + offset

const Content = styled(VStack)`
  flex: 1;
  min-height: 0;
`

const ListArea = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 320px;
`

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

/**
 * Searchable single-choice modal. The query is uncontrolled unless
 * `searchQuery` is supplied, which a caller needs when something outside the
 * modal has to rewrite it — adding a token from `renderEmptyState`, say.
 */
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
    renderEmptyState,
    searchQuery: controlledSearchQuery,
    onSearchQueryChange,
    virtualizePageSize,
    getKey,
    isLoading,
    loadingLabel,
  } = props

  const [uncontrolledSearchQuery, setUncontrolledSearchQuery] = useState('')

  const searchQuery = controlledSearchQuery ?? uncontrolledSearchQuery

  const setSearchQuery = (query: string) => {
    if (controlledSearchQuery === undefined) {
      setUncontrolledSearchQuery(query)
    }
    onSearchQueryChange?.(query)
  }

  const filtered = useMemo(
    () => options.filter(o => filterFunction(o, searchQuery)),
    [options, filterFunction, searchQuery]
  )

  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  const useVirtual = Boolean(virtualizePageSize) && filtered.length > 30

  // The loading overlay owns the empty frame while a slower chain's options are
  // still on the way, so an empty state can't flash before the list arrives.
  const emptyState =
    !isLoading && filtered.length === 0 ? renderEmptyState?.() : undefined

  return (
    <Modal onClose={() => onFinishRef.current()} title={title}>
      <Content gap={8}>
        {/* An active query has to stay clearable even when it leaves the modal
            with fewer options than the field's own threshold. */}
        {options.length > 1 || searchQuery ? (
          <SearchField value={searchQuery} onSearch={setSearchQuery} />
        ) : null}
        {renderListHeader?.() || <div />}

        <ListArea aria-busy={isLoading}>
          {/* While loading, the list still shows the previous chain's items.
              Make it inert so keyboard/assistive tech can't focus or activate a
              stale option and close the modal, and guard onFinish as a backstop. */}
          <ListWrapper inert={isLoading}>
            {emptyState ?? (
              <>
                {useVirtual ? (
                  <Virtuoso
                    style={{ flex: 1 }}
                    totalCount={filtered.length}
                    data={filtered}
                    increaseViewportBy={
                      virtualizePageSize ??
                      defaultIncreaseViewportForVirtualizedList
                    }
                    itemContent={(index, item) => (
                      <OptionComponent
                        value={item}
                        onClick={() => {
                          if (!isLoading) onFinishRef.current(item)
                        }}
                      />
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
                        onClick={() => {
                          if (!isLoading) onFinishRef.current(option)
                        }}
                      />
                    ))}
                  </NonVirtualList>
                )}
              </>
            )}
          </ListWrapper>
          {isLoading ? (
            <CenterAbsolutely
              role="status"
              aria-live="polite"
              aria-label={loadingLabel}
            >
              <Spinner size="2.5em" />
            </CenterAbsolutely>
          ) : null}
        </ListArea>

        {renderFooter?.()}
      </Content>
    </Modal>
  )
}

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
