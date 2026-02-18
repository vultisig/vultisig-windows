import { Chain } from '@core/chain/Chain'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useState } from 'react'
import styled from 'styled-components'

import { CopyableValue } from '../shared/CopyableValue'
import { DetailRow } from '../shared/DetailRow'
import { ExplorerLink } from '../shared/ExplorerLink'
import { SelfBadge } from '../shared/SelfBadge'
import {
  CalldataQuery,
  getExplorerAddressUrl,
  parseDecodedParams,
  truncateHex,
} from './utils'

type Props = {
  data: string
  query: CalldataQuery
  label: string
  tokenDecimals?: number
  chain?: Chain | null
  selfAddress?: string
}

export const DecodedCalldata: FC<Props> = ({
  data,
  query,
  label,
  tokenDecimals,
  chain,
  selfAddress,
}) => {
  const [expanded, setExpanded] = useState(false)
  const decoded = query.data

  const functionName = decoded ? decoded.functionSignature.split('(')[0] : null

  const params = decoded
    ? parseDecodedParams(
        decoded.functionSignature,
        decoded.functionArguments,
        tokenDecimals
      )
    : []

  if (!data) return null

  const selector = data.slice(0, 10)

  return (
    <>
      <DetailRow style={{ padding: '4px 0' }}>
        <Text size={12} color="supporting">
          {label} Function
        </Text>
        <HStack gap={4} alignItems="center">
          {query.isPending ? (
            <Text size={12} color="shy">
              Decoding...
            </Text>
          ) : functionName ? (
            <FunctionButton onClick={() => setExpanded(prev => !prev)}>
              <Text family="mono" size={12} weight={600} color="primary">
                {decoded?.functionSignature}
              </Text>
              <RotatingChevron $expanded={expanded} style={{ fontSize: 12 }} />
            </FunctionButton>
          ) : (
            <Text family="mono" size={12} color="supporting">
              {selector}
            </Text>
          )}
        </HStack>
      </DetailRow>
      {expanded && decoded && (
        <CalldataParamsBlock>
          {params.map((param, i) => {
            if (!param.value) return null

            const isAddress = param.type === 'address'
            const isSelf =
              isAddress &&
              selfAddress &&
              param.value.toLowerCase() === selfAddress.toLowerCase()
            const addressUrl =
              isAddress && chain
                ? getExplorerAddressUrl(chain, param.value)
                : null

            return (
              <DetailRow key={i} style={{ padding: '4px 0' }}>
                <Text size={12} color="supporting">
                  arg{i}{' '}
                  <Text as="span" family="mono" size={11} color="shy">
                    ({param.type})
                  </Text>
                </Text>
                <VStack gap={1} alignItems="end">
                  {isAddress ? (
                    <HStack gap={4} alignItems="center">
                      {addressUrl ? (
                        <ExplorerLink
                          href={addressUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {param.formatted ?? param.value} &#x2197;
                        </ExplorerLink>
                      ) : (
                        <CopyableValue value={param.value} />
                      )}
                      {isSelf && (
                        <SelfBadge>
                          <Text size={10}>(SELF)</Text>
                        </SelfBadge>
                      )}
                    </HStack>
                  ) : (
                    <>
                      <Text family="mono" size={12} weight={500}>
                        {param.formatted ?? truncateHex(param.value)}
                      </Text>
                      {param.formatted && <CopyableValue value={param.value} />}
                    </>
                  )}
                </VStack>
              </DetailRow>
            )
          })}
          <DetailRow style={{ padding: '4px 0' }}>
            <Text size={12} color="supporting">
              Raw Data
            </Text>
            <CopyableValue value={data} display={truncateHex(data)} />
          </DetailRow>
        </CalldataParamsBlock>
      )}
    </>
  )
}

const FunctionButton = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`

const CalldataParamsBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 6px;
  background: ${getColor('foreground')};
`

const RotatingChevron = styled(ChevronDownIcon)<{ $expanded: boolean }>`
  transition: transform 0.2s ease;
  transform: rotate(${({ $expanded }) => ($expanded ? '180deg' : '0deg')});
  font-size: 16px;
  color: ${getColor('textShy')};
`
