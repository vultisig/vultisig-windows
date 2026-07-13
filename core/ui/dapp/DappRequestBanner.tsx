import { BrowserExtensionIcon } from '@lib/ui/icons/BrowserExtensionIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { DAppMetadata } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
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

const getHostname = (url: string) => {
  const result = attempt(() => new URL(url).hostname)
  return 'data' in result ? result.data : url
}

type DappRequestBannerProps = {
  value?: DAppMetadata
}

/**
 * "Request from" banner identifying the dApp that initiated the transaction.
 * Reads from the keysign payload's `dappMetadata`, so it is available on every
 * cosigning device (initiator and joiner alike). Renders nothing for non-dApp
 * transactions, where `dappMetadata` is absent.
 */
export const DappRequestBanner = ({ value }: DappRequestBannerProps) => {
  const { t } = useTranslation()

  if (!value || !value.url) {
    return null
  }

  const { name, url, iconUrl } = value
  const hostname = getHostname(url)

  return (
    <Panel>
      <Text color="shy" size={14} weight={500}>
        {t('request_from')}
      </Text>
      <HStack alignItems="center" gap={12}>
        <SafeImage
          src={iconUrl || undefined}
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
