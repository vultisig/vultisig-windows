// import { useDefaultChains } from '../../../lib/hooks/useDefaultChains';
// import { CheckIcon } from '../../../lib/ui/icons/CheckIcon';
import { VStack } from '../../../lib/ui/layout/Stack';
// import { Text } from '../../../lib/ui/text';
// import { PageHeader } from '../../../ui/page/PageHeader';
// import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
// import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
// import { PageSlice } from '../../../ui/page/PageSlice';
// import { useVaultChainsBalancesQuery } from '../../../vault/queries/useVaultChainsBalancesQuery';
// import { useCurrentVault } from '../../../vault/state/useCurrentVault';
// import { ChainBox, ChainButton } from './VaultDefaultChains.styles';

// const CHAINS = ['ethereum', 'avalanche', 'base', 'cronos-chain'];

const VaultDefaultChains = () => {
  // TODO: currently missing an endpoint for getting all chains, when yu get it implement the list, select the default chains and if a chain is select/unselected, update the defautl chains in settings.
  // const { defaultChains } = useDefaultChains();

  return (
    <VStack flexGrow gap={16}>
      {/* <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>{t('vault_settings_language')}</PageHeaderTitle>
        }
      />
      <PageSlice gap={16} flexGrow={true}>
        {languageOptions.map(({ title, subtitle, value }, index) => (
          <ChainButton key={index} onClick={() => updateInAppLanguage(value)}>
            <ChainBox>
              <Text size={16} color="contrast" weight="600">
                {t(title)}
              </Text>
              <Text size={12} color="contrast" weight="500">
                {t(subtitle)}
              </Text>
            </ChainBox>
            {value === language && <CheckIcon />}
          </ChainButton>
        ))}
      </PageSlice> */}
    </VStack>
  );
};

export default VaultDefaultChains;
