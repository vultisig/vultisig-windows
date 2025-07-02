import { ScanResponse } from '@core/config/security/blockaid/types'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { QueryObserverResult } from '@tanstack/react-query'
import styled from 'styled-components'

const Wrapper = styled.span<{ color: string }>``

type Props = {
  query: QueryObserverResult<ScanResponse | null>
}

export const SecurityStatusBadge = ({ query }: Props) => {
  if (query.isFetching) return <Spinner size={12} />
  if (!query.data) return null

  return (
    <Wrapper color="red">
      <TriangleAlertIcon color="alertError" fontSize={16} />
    </Wrapper>
  )
}
