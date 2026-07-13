import { useDappRequest } from '@core/ui/state/dappRequest'
import { BrowserExtensionIcon } from '@lib/ui/icons/BrowserExtensionIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Panel = styled(VStack)`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  gap: 16px;
  padding: 20px;
`

const Image = styled.img`
  border-radius: 50%;
  height: 32px;
  width: 32px;
`

const FallbackIcon = styled(HStack)`
  align-items: center;
  background-color: ${getColor('foregroundExtra')};
  border-radius: 50%;
  color: ${getColor('text')};
  font-size: 18px;
  height: 32px;
  justify-content: center;
  width: 32px;
`

const getHostname = (origin: string) => {
  const result = attempt(() => new URL(origin).hostname)
  return 'data' in result ? result.data : origin
}

/**
 * "Request from" banner identifying the dApp that initiated the transaction.
 * Renders nothing unless a {@link useDappRequest} value is present, so it is
 * safe to place on shared screens used by both dApp and in-wallet flows.
 */
export const DappRequestBanner = () => {
  const { t } = useTranslation()
  const dappRequest = useDappRequest()

  if (!dappRequest) {
    return null
  }

  const { origin, name, favicon } = dappRequest
  const hostname = getHostname(origin)

  return (
    <Panel>
      <Text color="shy" size={14} weight={500}>
        {t('request_from')}
      </Text>
      <HStack alignItems="center" gap={12}>
        <SafeImage
          src={favicon}
          fallback={
            <FallbackIcon>
              <BrowserExtensionIcon />
            </FallbackIcon>
          }
          render={props => <Image alt="" {...props} />}
        />
        <VStack gap={2}>
          {name && (
            <Text size={16} weight={500}>
              {name}
            </Text>
          )}
          <Text color="shy" size={name ? 13 : 16} weight={500}>
            {hostname}
          </Text>
        </VStack>
      </HStack>
    </Panel>
  )
}
