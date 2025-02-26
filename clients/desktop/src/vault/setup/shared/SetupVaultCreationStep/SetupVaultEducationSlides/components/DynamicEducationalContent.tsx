import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { VStack } from '../../../../../../lib/ui/layout/Stack'
import { GradientText, Text } from '../../../../../../lib/ui/text'
import { SetupFastVaultEducationSlidesStep } from '..'

type DynamicEducationContentProps = {
  value: SetupFastVaultEducationSlidesStep
}

const contents: Record<
  SetupFastVaultEducationSlidesStep,
  Record<string, string>
> = {
  multiFactor: {
    title: 'while_you_wait_vultisig_is',
    descriptionOne: 'fastVaultSetup.createVault.multiFactor.descriptionOne',
    descriptionTwo: 'fastVaultSetup.createVault.multiFactor.descriptionTwo',
  },
  selfCustodial: {
    title: 'while_you_wait_vultisig_is',
    descriptionOne: 'fastVaultSetup.createVault.selfCustodial.descriptionOne',
    descriptionTwo: 'fastVaultSetup.createVault.selfCustodial.descriptionTwo',
  },
  crossChain: {
    title: 'while_you_wait_vultisig_is',
    descriptionOne: 'fastVaultSetup.createVault.crossChain.descriptionOne',
    descriptionTwo: 'fastVaultSetup.createVault.crossChain.descriptionTwo',
  },
  availablePlatforms: {
    title: 'while_you_wait_vultisig_is',
    descriptionOne:
      'fastVaultSetup.createVault.availablePlatforms.descriptionOne',
    descriptionTwo:
      'fastVaultSetup.createVault.availablePlatforms.descriptionTwo',
  },
  seedlessWallet: {
    title: 'while_you_wait_vultisig_is',
    descriptionOne: 'fastVaultSetup.createVault.seedlessWallet.descriptionOne',
    descriptionTwo: 'fastVaultSetup.createVault.seedlessWallet.descriptionTwo',
  },
}

export const DynamicEducationContent: FC<DynamicEducationContentProps> = ({
  value,
}) => {
  const { t } = useTranslation()
  const { title, descriptionOne, descriptionTwo } = contents[value]

  return (
    <VStack justifyContent="center" gap={12}>
      <Text centerHorizontally color="shy" size={16}>
        {t(title)}
      </Text>
      <VStack justifyContent="center">
        <GradientText centerHorizontally size={42} weight={500}>
          {t(descriptionOne)}
        </GradientText>{' '}
        <Text weight={500} centerHorizontally as="span" size={30}>
          {t(descriptionTwo)}
        </Text>
      </VStack>
    </VStack>
  )
}
