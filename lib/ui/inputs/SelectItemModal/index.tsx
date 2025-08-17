import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { OnFinishProp, OptionsProp, TitleProp } from '@lib/ui/props'
import { SearchField } from '@lib/ui/search/SearchField'
import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'

import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

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

export const SelectItemModal = <T extends { id?: string; chain?: string }>({
  onFinish,
  options,
  title,
  optionComponent: OptionComponent,
  filterFunction,
  renderFooter,
  renderListHeader,
  virtualizePageSize,
  getKey,
}: SelectItemModalProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(
    () => options.filter(o => filterFunction(o, searchQuery)),
    [options, filterFunction, searchQuery]
  )

  const pageSize = virtualizePageSize ?? filtered.length
  const [visibleCount, setVisibleCount] = useState(
    Math.min(pageSize, filtered.length)
  )

  useEffect(() => {
    setVisibleCount(Math.min(pageSize, filtered.length))
  }, [filtered.length, pageSize])

  const listRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(() => {
    setVisibleCount(c => Math.min(c + pageSize, filtered.length))
  }, [pageSize, filtered.length])

  const sentinelRef = useIntersectionObserver<HTMLDivElement>({
    rootRef: listRef,
    rootMargin: '120px 0px 120px 0px',
    threshold: 0,
    onIntersect: () => {
      if (virtualizePageSize && visibleCount < filtered.length) {
        loadMore()
      }
    },
  })

  const slice = virtualizePageSize ? filtered.slice(0, visibleCount) : filtered

  const defaultGetKey = (o: T, i: number) =>
    `${(o as any).id ?? ''}-${(o as any).chain ?? ''}-${i}`

  return (
    <Modal onClose={() => onFinish()} title={title}>
      <VStack gap={8}>
        {options.length > 1 && <SearchField onSearch={setSearchQuery} />}
        {renderListHeader?.() || <div />}

        <ListWrapper ref={listRef} flexGrow>
          {slice.map((option, index) => (
            <OptionComponent
              key={(getKey ?? defaultGetKey)(option, index)}
              value={option}
              onClick={() => onFinish(option)}
            />
          ))}

          {virtualizePageSize && visibleCount < filtered.length && (
            <Sentinel ref={sentinelRef} />
          )}
        </ListWrapper>

        {renderFooter?.()}
      </VStack>
    </Modal>
  )
}

const ListWrapper = styled(VStack)`
  max-height: 400px;
  overflow-y: auto;

  & > :first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  & > :last-child {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`

const Sentinel = styled.div`
  height: 1px;
`
