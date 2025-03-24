import type { TFunction } from 'i18next'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { VStack } from '../../../../../../lib/ui/layout/Stack'
import { GradientText, Text } from '../../../../../../lib/ui/text'
import { SetupFastVaultEducationSlidesStep } from '..'

type DynamicEducationContentProps = {
  value: SetupFastVaultEducationSlidesStep
}

type ContentItem = {
  title: string
  descriptionOne: string
  descriptionTwo: string
}

const getContents = (
  t: TFunction
): Record<SetupFastVaultEducationSlidesStep, ContentItem> => ({
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

export const DynamicEducationContent: FC<DynamicEducationContentProps> = ({
  value,
}) => {
  const { t } = useTranslation()
  const contents = getContents(t)
  const { title, descriptionOne, descriptionTwo } = contents[value]

  return (
    <VStack justifyContent="center" gap={12}>
      <Text centerHorizontally color="shy" size={16}>
        {title}
      </Text>
      <VStack justifyContent="center">
        <GradientText centerHorizontally size={42} weight={500}>
          {descriptionOne}
        </GradientText>{' '}
        <Text weight={500} centerHorizontally as="span" size={30}>
          {descriptionTwo}
        </Text>
      </VStack>
    </VStack>
  )
}
