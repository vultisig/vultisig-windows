import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { VStack } from '@lib/ui/layout/Stack'
import { useIsTabletDeviceAndUp } from '@lib/ui/responsive/mediaQuery'
import { GradientText, Text } from '@lib/ui/text'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useInterval } from 'react-use'

const SLIDE_DURATION_IN_MS = 6000
const steps = [
  'multiFactor',
  'selfCustodial',
  'crossChain',
  'availablePlatforms',
  'seedlessWallet',
] as const

type Step = (typeof steps)[number]

type ContentItem = {
  title: string
  descriptionOne: string
  descriptionTwo: string
}

const getContents = (t: TFunction): Record<Step, ContentItem> => ({
  multiFactor: {
    title: t('while_you_wait_vultisig_is'),
    descriptionOne: t('fastVaultSetup.createVault.multiFactor.descriptionOne'),
    descriptionTwo: t('fastVaultSetup.createVault.multiFactor.descriptionTwo'),
  },
  selfCustodial: {
    title: t('while_you_wait_vultisig_is'),
    descriptionOne: t(
      'fastVaultSetup.createVault.selfCustodial.descriptionOne'
    ),
    descriptionTwo: t(
      'fastVaultSetup.createVault.selfCustodial.descriptionTwo'
    ),
  },
  crossChain: {
    title: t('while_you_wait_vultisig_is'),
    descriptionOne: t('fastVaultSetup.createVault.crossChain.descriptionOne'),
    descriptionTwo: t('fastVaultSetup.createVault.crossChain.descriptionTwo'),
  },
  availablePlatforms: {
    title: t('while_you_wait_vultisig_is'),
    descriptionOne: t(
      'fastVaultSetup.createVault.availablePlatforms.descriptionOne'
    ),
    descriptionTwo: t(
      'fastVaultSetup.createVault.availablePlatforms.descriptionTwo'
    ),
  },
  seedlessWallet: {
    title: t('while_you_wait_vultisig_is'),
    descriptionOne: t(
      'fastVaultSetup.createVault.seedlessWallet.descriptionOne'
    ),
    descriptionTwo: t(
      'fastVaultSetup.createVault.seedlessWallet.descriptionTwo'
    ),
  },
})

export const KeygenProductEducation = () => {
  const { step, toNextStep } = useStepNavigation({ steps, circular: true })
  useInterval(() => toNextStep(), SLIDE_DURATION_IN_MS)

  const { t } = useTranslation()
  const contents = getContents(t)
  const { title, descriptionOne, descriptionTwo } = contents[step]
  const isTabletDeviceAndUp = useIsTabletDeviceAndUp()

  return (
    <VStack justifyContent="center" gap={12}>
      <Text centerHorizontally color="shy" size={16}>
        {title}
      </Text>
      <VStack justifyContent="center">
        <GradientText
          centerHorizontally
          size={isTabletDeviceAndUp ? 42 : 24}
          weight={500}
        >
          {descriptionOne}
        </GradientText>{' '}
        <Text
          weight={500}
          centerHorizontally
          as="span"
          size={isTabletDeviceAndUp ? 30 : 18}
        >
          {descriptionTwo}
        </Text>
      </VStack>
    </VStack>
  )
}
