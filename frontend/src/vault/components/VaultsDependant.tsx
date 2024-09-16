import { Center } from '../../lib/ui/layout/Center';
import { ComponentWithChildrenProps } from '../../lib/ui/props';
import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { Text } from '../../lib/ui/text';
import { ProductLogoBlock } from '../../ui/logo/ProductLogoBlock';
import { useVaultsQuery } from '../queries/useVaultsQuery';

export const VaultsDependant = ({ children }: ComponentWithChildrenProps) => {
  const query = useVaultsQuery();

  return (
    <QueryDependant
      query={query}
      success={() => children}
      error={err => {
        console.log('vautls query: ', err);
        return (
          <Center>
            <Text size={16} weight="500" color="contrast">
              Failed to load vaults
            </Text>
          </Center>
        );
      }}
      pending={() => <ProductLogoBlock />}
    />
  );
};
