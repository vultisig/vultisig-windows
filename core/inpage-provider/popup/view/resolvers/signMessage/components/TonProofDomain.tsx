import { getOriginHostname } from '@core/inpage-provider/popup/signMessage/getOriginHostname'
import {
  Divider,
  Section,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type TonProofDomainProps = {
  domain: string
  origin: string
}

/**
 * Shows the app domain a TON proof is bound to next to the site asking for
 * it. The domain comes from the dApp's manifest, so a phishing page can claim
 * another app's domain; a mismatch is called out.
 */
export const TonProofDomain: FC<TonProofDomainProps> = ({ domain, origin }) => {
  const { t } = useTranslation()
  const originHostname = getOriginHostname(origin) ?? origin

  return (
    <Section gap={12} padding={24}>
      <HStack
        alignItems="center"
        gap={8}
        justifyContent="space-between"
        wrap="nowrap"
      >
        <Text as="span" color="shy" size={14} weight={500} nowrap>
          {t('ton_proof_domain')}
        </Text>
        <Text as="span" size={14} weight={500}>
          {domain}
        </Text>
      </HStack>
      <Divider />
      <HStack
        alignItems="center"
        gap={8}
        justifyContent="space-between"
        wrap="nowrap"
      >
        <Text as="span" color="shy" size={14} weight={500} nowrap>
          {t('request_from')}
        </Text>
        <Text as="span" size={14} weight={500}>
          {originHostname}
        </Text>
      </HStack>
      {domain !== originHostname && (
        <Text color="danger" size={13} weight={500}>
          {t('ton_proof_domain_mismatch')}
        </Text>
      )}
    </Section>
  )
}
