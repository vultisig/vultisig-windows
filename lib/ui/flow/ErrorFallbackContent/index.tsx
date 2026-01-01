import { CircleAlertIcon } from '@lib/ui/icons/CircleAlertIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import styled from 'styled-components'

export type ErrorFallbackContentProps = TitleProp & { error?: unknown }

export const ErrorFallbackContent = ({
  error,
  title,
}: ErrorFallbackContentProps) => {
  return (
    <VStack alignItems="center" gap={24} justifyContent="center" flexGrow>
      <IconWrapper alignItems="center" justifyContent="center">
        <CircleAlertIcon />
      </IconWrapper>
      <VStack alignItems="center" gap={12} maxWidth={350}>
        <Text size={22} color="idle" centerHorizontally>
          {title}
        </Text>
        {error ? (
          <Text
            color="shy"
            size={14}
            style={{ wordBreak: 'break-word', maxWidth: '100%' }}
            centerHorizontally
          >
            {extractErrorMsg(error)}
          </Text>
        ) : null}
      </VStack>
    </VStack>
  )
}

const IconWrapper = styled(HStack)`
  border-color: ${getColor('idle')};
  border-radius: 50%;
  border-style: solid;
  border-width: 1px;
  font-size: 20px;
  height: 24px;
  padding: 1px;
  position: relative;
  width: 24px;

  svg {
    fill: ${getColor('idle')};
    color: ${getColor('foreground')};
  }

  &::after {
    border-color: ${getColor('foregroundDark')};
    border-radius: 50%;
    border-style: solid;
    border-width: 1px;
    content: '';
    height: 136px;
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 136px;
    z-index: -1;
  }

  &::before {
    border-color: ${getColor('foregroundDark')};
    border-radius: 50%;
    border-style: solid;
    border-width: 1px;
    content: '';
    height: 72px;
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 72px;
    z-index: -1;
  }
`
