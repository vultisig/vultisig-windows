import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { VStack } from '../../../../../lib/ui/layout/Stack';
import { GradientText, Text } from '../../../../../lib/ui/text';
import { SetupFastVaultEducationSlidesStep } from '..';

type DynamicEducationContentProps = {
  value: SetupFastVaultEducationSlidesStep;
};

const contents: Record<
  SetupFastVaultEducationSlidesStep,
  Record<string, string>
> = {
  multiFactor: {
    title: 'while_you_wait_vultisig_is',
    description: 'fastVaultSetup.createVault.multiFactor.description',
  },
  selfCustodial: {
    title: 'while_you_wait_vultisig_is',
    description: 'fastVaultSetup.createVault.selfCustodial.description',
  },
  crossChain: {
    title: 'while_you_wait_vultisig_is',
    description: 'fastVaultSetup.createVault.crossChain.description',
  },
  over30Chains: {
    title: 'while_you_wait_vultisig_has',
    description: 'fastVaultSetup.createVault.over30Chains.description',
  },
  availablePlatforms: {
    title: 'while_you_wait_vultisig_is',
    description: 'fastVaultSetup.createVault.availablePlatforms.description',
  },
  seedlessWallet: {
    title: 'while_you_wait_vultisig_is',
    description: 'fastVaultSetup.createVault.seedlessWallet.description',
  },
};

export const DynamicEducationContent: FC<DynamicEducationContentProps> = ({
  value,
}) => {
  const { t } = useTranslation();
  const { title, description } = contents[value];

  return (
    <VStack justifyContent="center" gap={12}>
      <Text centerHorizontally color="shy" size={22}>
        {t(title)}
      </Text>
      <GradientText centerHorizontally size={38}>
        {t(description)}
      </GradientText>
    </VStack>
  );
};
