import {
  Image,
  Section,
  Verify,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { usePopupContext } from '@core/inpage-provider/popup/view/state/context'
import { BadgeCheckIcon } from '@lib/ui/icons/BadgeCheckIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type SenderProps = {
  isValidated?: boolean
}

export const Sender: FC<SenderProps> = ({ isValidated }) => {
  const { t } = useTranslation()
  const { requestFavicon, requestOrigin } = usePopupContext<'signMessage'>()

  return (
    <Section gap={24}>
      <Text as="span" color="shy" size={14} weight={500}>
        {t(`request_from`)}
      </Text>
      <HStack gap={12} alignItems="center" justifyContent="space-between">
        <HStack alignItems="center" gap={12}>
          <SafeImage
            src={requestFavicon}
            render={props => <Image alt="" {...props} />}
          />
          <Text as="span" size={14} weight={500}>
            {getUrlBaseDomain(requestOrigin)}
          </Text>
        </HStack>
        {isValidated && (
          <Verify alignItems="center" gap={4}>
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
