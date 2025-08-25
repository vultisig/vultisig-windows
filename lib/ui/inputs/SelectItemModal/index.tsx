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
  useState,
} from 'react'
import styled from 'styled-components'

import { useIntersection } from '../../hooks/useIntersection'

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
  const filtered = useMemo(
    () => options.filter(o => filterFunction(o, searchQuery)),
    [options, filterFunction, searchQuery]
  )

  const pageSize = virtualizePageSize ?? filtered.length
  const [visibleCount, setVisibleCount] = useState(
    Math.min(pageSize, filtered.length)
  )
  useEffect(
    () => setVisibleCount(Math.min(pageSize, filtered.length)),
    [filtered.length, pageSize]
  )

  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null)
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null)

  const loadMore = useCallback(() => {
    setVisibleCount(c => Math.min(c + pageSize, filtered.length))
  }, [pageSize, filtered.length])

  const intersection = useIntersection({
    target: sentinelEl,
    root: rootEl,
    rootMargin: '0px 0px 200px 0px',
    threshold: 0,
  })

  useEffect(() => {
    if (!virtualizePageSize) return
    if (intersection?.isIntersecting && visibleCount < filtered.length) {
      loadMore()
    }
  }, [
    intersection?.isIntersecting,
    virtualizePageSize,
    visibleCount,
    filtered.length,
    loadMore,
  ])

  const slice = virtualizePageSize ? filtered.slice(0, visibleCount) : filtered

  return (
    <Modal onClose={() => onFinish()} title={title}>
      <VStack gap={8}>
        {options.length > 1 && <SearchField onSearch={setSearchQuery} />}
        {renderListHeader?.() || <div />}

        <ListWrapper ref={setRootEl}>
          {slice.map((option, index) => (
            <OptionComponent
              key={getKey?.(option, index) || option?.id || index}
              value={option}
              onClick={() => onFinish(option)}
            />
          ))}
          {virtualizePageSize && visibleCount < filtered.length && (
            <Sentinel ref={setSentinelEl} />
          )}
        </ListWrapper>

        {renderFooter?.()}
      </VStack>
    </Modal>
  )
}

// Use a DOM element to guarantee the ref is forwarded
const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  height: 2px;
  width: 100%;
`
