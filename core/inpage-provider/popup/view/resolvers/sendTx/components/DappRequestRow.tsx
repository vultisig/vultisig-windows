import { usePopupContext } from '@core/inpage-provider/popup/view/state/context'
import { BrowserExtensionIcon } from '@lib/ui/icons/BrowserExtensionIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt } from '@vultisig/lib-utils/attempt'
import styled from 'styled-components'

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

export const DappRequestDivider = styled.div`
  background-color: ${getColor('foregroundExtra')};
  height: 1px;
`

const getHostname = (origin: string) => {
  const result = attempt(() => new URL(origin).hostname)
  return 'data' in result ? result.data : origin
}

export const DappRequestRow = () => {
  const { requestFavicon, requestOrigin } = usePopupContext<'sendTx'>()

  return (
    <HStack alignItems="center" gap={12}>
      <SafeImage
        src={requestFavicon}
        fallback={
          <FallbackIcon>
            <BrowserExtensionIcon />
          </FallbackIcon>
        }
        render={props => <Image alt="" {...props} />}
      />
      <Text size={16} weight={500}>
        {getHostname(requestOrigin)}
      </Text>
    </HStack>
  )
}
