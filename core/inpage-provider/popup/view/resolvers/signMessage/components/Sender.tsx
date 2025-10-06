import {
  Image,
  Section,
  Verify,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { BadgeCheckIcon } from '@lib/ui/icons/BadgeCheckIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type SenderProps = {
  favicon?: string
  isValidated?: boolean
  origin: string
}

export const Sender: FC<SenderProps> = ({ favicon, isValidated, origin }) => {
  const { t } = useTranslation()

  return (
    <Section gap={24} padding={24}>
      <Text as="span" color="shy" size={14} weight={500} nowrap>
        {t(`request_from`)}
      </Text>
      <HStack
        gap={12}
        alignItems="center"
        justifyContent="space-between"
        wrap="nowrap"
      >
        <HStack alignItems="center" gap={12} wrap="nowrap">
          <SafeImage
            src={favicon}
            render={props => <Image alt="" {...props} />}
          />
          <Text as="span" size={14} weight={500}>
            {getUrlBaseDomain(origin)}
          </Text>
        </HStack>
        {isValidated && (
          <Verify alignItems="center" gap={4} wrap="nowrap">
            <Text as={BadgeCheckIcon} color="success" size={16} />
            <Text as="span" size={12} weight={500}>
              {t('by_vultisig')}
            </Text>
          </Verify>
        )}
      </HStack>
    </Section>
  )
}
