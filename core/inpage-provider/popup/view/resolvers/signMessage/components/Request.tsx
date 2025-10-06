import {
  Divider,
  Section,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type RequestProps = {
  address: string
  message?: string
  method: string
}

export const Request: FC<RequestProps> = ({ address, message, method }) => {
  const { t } = useTranslation()

  return (
    <Section gap={12} padding={24}>
      <HStack
        alignItems="center"
        gap={8}
        justifyContent="space-between"
        wrap="nowrap"
      >
        <Text as="span" color="shy" size={14} weight={500} nowrap>
          {t('method')}
        </Text>
        <Text as="span" size={14} weight={500} nowrap>
          {method}
        </Text>
      </HStack>
      <Divider />
      {!!message && (
        <>
          <HStack
            alignItems="center"
            gap={8}
            justifyContent="space-between"
            wrap="nowrap"
          >
            <Text as="span" color="shy" size={14} weight={500} nowrap>
              {t('message')}
            </Text>
            <Text as="span" size={14} weight={500}>
              {message}
            </Text>
          </HStack>
          <Divider />
        </>
      )}
      <HStack
        alignItems="center"
        gap={8}
        justifyContent="space-between"
        wrap="nowrap"
      >
        <Text as="span" color="shy" size={14} weight={500} nowrap>
          {t('signing_address')}
        </Text>
        <MiddleTruncate
          justifyContent="end"
          size={14}
          text={address}
          weight={500}
          flexGrow
        />
      </HStack>
    </Section>
  )
}
